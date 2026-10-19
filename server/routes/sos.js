const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmergencyAlert } = require('../utils/emailService');
const { sendPushNotification } = require('../utils/pushNotification');
const { sendSOSAlert } = require('../utils/smsService');
const { sendWhatsAppSOS } = require('../utils/whatsappService');

// ========== Helper: Find Matching Donors ==========
async function findMatchingDonors(bloodGroup, district, excludeUserId) {
    // Blood group compatibility (donor blood groups who can donate to recipient with bloodGroup)
    const compatibility = {
        'A+':  ['A+', 'A-', 'O+', 'O-'],
        'A-':  ['A-', 'O-'],
        'B+':  ['B+', 'B-', 'O+', 'O-'],
        'B-':  ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+':  ['O+', 'O-'],
        'O-':  ['O-']
    };

    const compatibleGroups = compatibility[bloodGroup] || [bloodGroup];

    const donors = await User.find({
        _id: { $ne: excludeUserId },
        bloodGroup: { $in: compatibleGroups },
        isDonorAvailable: true,
        isBlocked: false
    }).select('name email profilePic bloodGroup district phoneNumber lastDonationDate fcmToken notificationSettings');

    // Filter eligible donors (90-day rule)
    const eligible = donors.filter(d => {
        if (!d.lastDonationDate) return true;
        const days = (Date.now() - new Date(d.lastDonationDate)) / (1000 * 60 * 60 * 24);
        return days >= 90;
    });

    // Sort: same district first
    eligible.sort((a, b) => {
        const aMatch = a.district?.toLowerCase() === district?.toLowerCase();
        const bMatch = b.district?.toLowerCase() === district?.toLowerCase();
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
    });

    return eligible;
}

// ========== Create SOS Alert ==========
// POST /api/sos
router.post('/', protect, async (req, res) => {
    try {
        const {
            bloodGroup, hospital, district, patientName,
            address, location, contactNumber, units, message
        } = req.body;

        if (!bloodGroup || !hospital || !district || !contactNumber) {
            return res.status(400).json({
                message: 'Blood group, hospital, district, and contact number are required'
            });
        }

        // Check if user has active SOS already
        const existingSOS = await SOSAlert.findOne({
            requester: req.user._id,
            status: 'Active',
            expiresAt: { $gt: new Date() }
        });

        if (existingSOS) {
            return res.status(400).json({
                message: 'You already have an active SOS alert',
                sosId: existingSOS._id
            });
        }

        // Create SOS alert
        const sosData = {
            requester: req.user._id,
            bloodGroup,
            hospital,
            district,
            patientName: patientName || req.user.name,
            address: address || '',
            contactNumber,
            units: units || 1,
            message: message || 'Emergency! Blood needed urgently!'
        };

        if (location && location.coordinates) {
            sosData.location = location;
        }

        const sos = await SOSAlert.create(sosData);
        await sos.populate('requester', 'name profilePic bloodGroup phoneNumber');

        // Find matching donors
        const matchingDonors = await findMatchingDonors(
            bloodGroup,
            district,
            req.user._id
        );

        // Store notified donor IDs
        sos.notifiedDonors = matchingDonors.map(d => d._id);
        await sos.save();

        // Get io from app
        const io = req.app.get('io');

        // Emit real-time alert to each matching donor
        if (io) {
            matchingDonors.forEach(donor => {
                io.to(donor._id.toString()).emit('sos-alert', {
                    _id: sos._id,
                    requester: {
                        _id: req.user._id,
                        name: req.user.name,
                        profilePic: req.user.profilePic,
                        phoneNumber: req.user.phoneNumber
                    },
                    bloodGroup: sos.bloodGroup,
                    hospital: sos.hospital,
                    district: sos.district,
                    address: sos.address,
                    patientName: sos.patientName,
                    contactNumber: sos.contactNumber,
                    units: sos.units,
                    message: sos.message,
                    createdAt: sos.createdAt
                });
            });

            // Broadcast to all online users (for the public emergency feed)
            io.emit('sos-broadcast', {
                _id: sos._id,
                bloodGroup: sos.bloodGroup,
                hospital: sos.hospital,
                district: sos.district,
                patientName: sos.patientName,
                requester: {
                    _id: req.user._id,
                    name: req.user.name,
                    profilePic: req.user.profilePic
                },
                units: sos.units,
                createdAt: sos.createdAt
            });
        }

        // Send emails to matching donors (in background, don't wait)
        Promise.all(
            matchingDonors.slice(0, 50).map(donor =>  // Max 50 emails
                sendEmergencyAlert(donor.email, {
                    bloodGroup: sos.bloodGroup,
                    hospital: sos.hospital,
                    district: sos.district,
                    quantity: sos.units,
                    urgency: 'EMERGENCY'
                }, donor.name).catch(err => 
                    console.error(`Failed to email ${donor.email}:`, err.message)
                )
            )
        ).catch(err => console.error('Email batch error:', err));

        // Push notifications (non-blocking)
        Promise.all(
            matchingDonors
                .filter(d => d.fcmToken && d.notificationSettings?.push !== false)
                .map(donor =>
                    sendPushNotification(donor.fcmToken, {
                        title: '🚨 EMERGENCY SOS',
                        body: `${sos.bloodGroup} blood needed at ${sos.hospital}, ${sos.district}`,
                        data: { sosId: sos._id.toString(), type: 'sos' },
                        clickAction: '/dashboard'
                    }).catch(() => {})
                )
        ).catch(() => {});

        // Send SMS to donors with SMS enabled (max 20)
        Promise.all(
            matchingDonors
                .filter(d => d.phoneNumber && d.notificationSettings?.sms)
                .slice(0, 20)
                .map(donor => 
                    sendSOSAlert(donor.phoneNumber, {
                        bloodGroup: sos.bloodGroup,
                        hospital: sos.hospital,
                        district: sos.district,
                        units: sos.units
                    }).catch(() => {})
                )
        ).catch(() => {});

        // Send WhatsApp to donors with WhatsApp enabled (max 30)
        Promise.all(
            matchingDonors
                .filter(d => d.phoneNumber && d.notificationSettings?.whatsapp)
                .slice(0, 30)
                .map(donor =>
                    sendWhatsAppSOS(donor.phoneNumber, {
                        bloodGroup: sos.bloodGroup,
                        hospital: sos.hospital,
                        district: sos.district,
                        units: sos.units
                    }).catch(() => {})
                )
        ).catch(() => {});

        res.status(201).json({
            success: true,
            sos,
            notifiedCount: matchingDonors.length,
            message: `SOS alert sent to ${matchingDonors.length} matching donors!`
        });
    } catch (error) {
        console.error('SOS create error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Active SOS Alerts ==========
// GET /api/sos/active
router.get('/active', protect, async (req, res) => {
    try {
        const alerts = await SOSAlert.find({
            status: 'Active',
            expiresAt: { $gt: new Date() }
        })
        .populate('requester', 'name profilePic bloodGroup district phoneNumber')
        .sort({ createdAt: -1 })
        .limit(20);

        // Add hasResponded flag
        const alertsWithFlag = alerts.map(a => ({
            ...a.toObject(),
            hasResponded: a.hasResponded(req.user._id),
            isOwn: a.requester?._id?.toString() === req.user._id.toString()
        }));

        res.json(alertsWithFlag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get My SOS Alerts ==========
// GET /api/sos/my
router.get('/my', protect, async (req, res) => {
    try {
        const alerts = await SOSAlert.find({ requester: req.user._id })
            .populate('respondedDonors.donor', 'name profilePic phoneNumber bloodGroup')
            .populate('fulfilledBy', 'name profilePic')
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Single SOS ==========
// GET /api/sos/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const sos = await SOSAlert.findById(req.params.id)
            .populate('requester', 'name profilePic bloodGroup district phoneNumber')
            .populate('respondedDonors.donor', 'name profilePic bloodGroup')
            .populate('fulfilledBy', 'name profilePic');

        if (!sos) {
            return res.status(404).json({ message: 'SOS alert not found' });
        }

        // Increment view count
        sos.viewCount += 1;
        await sos.save();

        res.json({
            ...sos.toObject(),
            hasResponded: sos.hasResponded(req.user._id),
            isOwn: sos.requester?._id?.toString() === req.user._id.toString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Respond to SOS (Donor Offers Help) ==========
// POST /api/sos/:id/respond
router.post('/:id/respond', protect, async (req, res) => {
    try {
        const sos = await SOSAlert.findById(req.params.id)
            .populate('requester', 'name profilePic');

        if (!sos) {
            return res.status(404).json({ message: 'SOS alert not found' });
        }

        if (sos.status !== 'Active') {
            return res.status(400).json({ message: 'This SOS is no longer active' });
        }

        if (sos.requester._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot respond to your own SOS' });
        }

        if (sos.hasResponded(req.user._id)) {
            return res.status(400).json({ message: 'You already responded to this SOS' });
        }

        // Add response
        sos.respondedDonors.push({
            donor: req.user._id,
            message: req.body.message || 'I can help!'
        });
        await sos.save();

        // Notify requester via socket
        const io = req.app.get('io');
        if (io) {
            io.to(sos.requester._id.toString()).emit('sos-response', {
                sosId: sos._id,
                donor: {
                    _id: req.user._id,
                    name: req.user.name,
                    profilePic: req.user.profilePic,
                    bloodGroup: req.user.bloodGroup,
                    phoneNumber: req.user.phoneNumber
                },
                message: req.body.message || 'I can help!',
                respondedAt: new Date()
            });
        }

        res.json({ message: 'Response sent to requester!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Mark SOS as Fulfilled ==========
// PUT /api/sos/:id/fulfill
router.put('/:id/fulfill', protect, async (req, res) => {
    try {
        const sos = await SOSAlert.findById(req.params.id);

        if (!sos) {
            return res.status(404).json({ message: 'SOS alert not found' });
        }

        if (sos.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        sos.status = 'Fulfilled';
        sos.fulfilledBy = req.body.donorId || null;
        await sos.save();

        // Broadcast fulfillment
        const io = req.app.get('io');
        if (io) {
            io.emit('sos-fulfilled', { sosId: sos._id });
        }

        res.json({ message: 'SOS marked as fulfilled', sos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Cancel SOS ==========
// PUT /api/sos/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const sos = await SOSAlert.findById(req.params.id);

        if (!sos) {
            return res.status(404).json({ message: 'SOS alert not found' });
        }

        if (sos.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        sos.status = 'Cancelled';
        await sos.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('sos-cancelled', { sosId: sos._id });
        }

        res.json({ message: 'SOS cancelled', sos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
