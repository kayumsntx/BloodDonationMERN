const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create blood request
router.post('/', protect, async (req, res) => {
    try {
        const { bloodGroup, quantity, hospital, district, urgency, description } = req.body;

        const request = await BloodRequest.create({
            requester: req.user._id,
            bloodGroup,
            quantity,
            hospital,
            district,
            urgency,
            description,
            status: 'Open'
        });

        const io = req.app.get('io');
        if (io) {
            const populated = await request.populate('requester', 'name profilePic phoneNumber');
            io.emit('new-request', populated);
        }

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all open requests
router.get('/', protect, async (req, res) => {
    try {
        const { bloodGroup, district, urgency } = req.query;
        const filter = { status: 'Open' };

        if (bloodGroup) filter.bloodGroup = bloodGroup;
        if (district) filter.district = district;
        if (urgency) filter.urgency = urgency;

        const requests = await BloodRequest.find(filter)
            .populate('requester', 'name profilePic phoneNumber')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my requests
router.get('/my', protect, async (req, res) => {
    try {
        const requests = await BloodRequest.find({ requester: req.user._id })
            .populate('donor', 'name profilePic phoneNumber')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get request by id
router.get('/:id', protect, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id)
            .populate('requester', 'name profilePic phoneNumber')
            .populate('donor', 'name profilePic phoneNumber');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update request status
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, donor } = req.body;
        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const isRequester = request.requester.toString() === req.user._id.toString();
        const isVolunteeringDonor = donor && donor.toString() === req.user._id.toString();

        if (!isRequester && !isVolunteeringDonor) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status && isRequester) {
            request.status = status;
        }
        if (donor) {
            request.donor = donor;
        }

        // 🆕 Auto-create donation record when fulfilled
        if (status === 'Fulfilled' && (donor || request.donor)) {
            const Donation = require('../models/Donation');
            const donorId = donor || request.donor;

            // Check if donation already exists for this request
            const existing = await Donation.findOne({ request: request._id });
            if (!existing) {
                await Donation.create({
                    donor: donorId,
                    recipient: request.requester,
                    request: request._id,
                    bloodGroup: request.bloodGroup,
                    hospital: request.hospital,
                    district: request.district,
                    units: request.quantity || 1
                });

                // Update donor's stats
                const donorUser = await User.findById(donorId);
                if (donorUser) {
                    donorUser.totalDonations += 1;
                    donorUser.lastDonationDate = new Date();
                    donorUser.setNextEligibleDate();
                    donorUser.updateBadge();
                    await donorUser.save();
                }
            }
        }

        await request.save();

        const populated = await BloodRequest.findById(request._id)
            .populate('requester', 'name profilePic phoneNumber bloodGroup')
            .populate('donor', 'name profilePic phoneNumber bloodGroup');

        res.json(populated || request);
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;