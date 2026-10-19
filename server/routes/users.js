const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkEligibility, daysUntilEligible } = require('../utils/eligibility');
const Donation = require('../models/Donation');

// ========== Get Eligibility Status of Current User ==========
// GET /api/users/eligibility
router.get('/eligibility', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const eligibility = checkEligibility(user);

        // Also add last donation info
        const lastDonation = await Donation.findOne({ donor: req.user._id })
            .sort({ donatedAt: -1 });

        res.json({
            ...eligibility,
            lastDonation: lastDonation ? {
                date: lastDonation.donatedAt,
                hospital: lastDonation.hospital,
                district: lastDonation.district,
                bloodGroup: lastDonation.bloodGroup
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Donor List with Eligibility Filter ==========
// GET /api/users/donors/search?bloodGroup=O+&district=Dhaka&eligibleOnly=true
router.get('/donors/search', protect, async (req, res) => {
    try {
        const { bloodGroup, district, eligibleOnly } = req.query;

        const filter = {
            _id: { $ne: req.user._id },
            isDonorAvailable: true
        };

        if (bloodGroup && bloodGroup !== 'All') {
            filter.bloodGroup = bloodGroup;
        }

        if (district) {
            filter.district = { $regex: district, $options: 'i' };
        }

        const users = await User.find(filter).select('-password');

        // Add eligibility info to each user
        const donorsWithEligibility = users.map(user => {
            const eligibility = checkEligibility(user);
            return {
                ...user.toObject(),
                eligibility: {
                    eligible: eligibility.eligible,
                    reason: eligibility.reason,
                    nextEligibleDate: eligibility.nextEligibleDate,
                    daysRemaining: eligibility.daysRemaining
                }
            };
        });

        // Filter if eligibleOnly requested
        const finalList = eligibleOnly === 'true'
            ? donorsWithEligibility.filter(d => d.eligibility.eligible)
            : donorsWithEligibility;

        // Sort: eligible first, then by total donations
        finalList.sort((a, b) => {
            if (a.eligibility.eligible !== b.eligibility.eligible) {
                return (b.eligibility.eligible ? 1 : 0) - (a.eligibility.eligible ? 1 : 0);
            }
            return (b.totalDonations || 0) - (a.totalDonations || 0);
        });

        res.json(finalList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Users Who Just Became Eligible ==========
// GET /api/users/eligible-now
router.get('/eligible-now', protect, async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id },
            isDonorAvailable: true
        }).select('-password');

        const justEligible = users.filter(u => {
            const eligibility = checkEligibility(u);
            return eligibility.eligible;
        });

        res.json(justEligible);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by id
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, age, bloodGroup, phoneNumber, district, address, bio } = req.body;

        user.name = name || user.name;
        user.age = age || user.age;
        user.bloodGroup = bloodGroup || user.bloodGroup;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.district = district || user.district;
        user.address = address || user.address;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update donor availability
router.put('/donor-status', protect, async (req, res) => {
    try {
        const { isDonorAvailable } = req.body;
        const user = await User.findById(req.user._id);
        user.isDonorAvailable = isDonorAvailable;
        await user.save();
        res.json({ isDonorAvailable: user.isDonorAvailable });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile picture
router.put('/profile-pic', protect, async (req, res) => {
    try {
        const { profilePic } = req.body;
        const user = await User.findById(req.user._id);
        user.profilePic = profilePic;
        await user.save();
        res.json({ profilePic: user.profilePic });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save FCM token
router.post('/fcm-token', protect, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.user._id, { fcmToken });
        res.json({ message: 'FCM token saved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get notification preferences
router.get('/notification-settings', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.notificationSettings || {
            push: true, email: true, sms: false, whatsapp: false, digest: true, marketing: false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update notification preferences
router.put('/notification-settings', protect, async (req, res) => {
    try {
        const { push, email, sms, whatsapp, digest, marketing } = req.body;
        const user = await User.findById(req.user._id);
        user.notificationSettings = {
            ...user.notificationSettings,
            ...(push !== undefined && { push }),
            ...(email !== undefined && { email }),
            ...(sms !== undefined && { sms }),
            ...(whatsapp !== undefined && { whatsapp }),
            ...(digest !== undefined && { digest }),
            ...(marketing !== undefined && { marketing })
        };
        await user.save();
        res.json(user.notificationSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user GPS location (Day 15)
router.put('/location', protect, async (req, res) => {
    try {
        const { longitude, latitude } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
        });
        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Nearby donors (Day 17)
router.get('/donors/nearby', protect, async (req, res) => {
    try {
        const { lng, lat, maxKm = 50, bloodGroup } = req.query;
        if (!lng || !lat) {
            return res.status(400).json({ message: 'Longitude and latitude are required' });
        }
        const filter = { isDonorAvailable: true, _id: { $ne: req.user._id } };
        if (bloodGroup && bloodGroup !== 'All') filter.bloodGroup = bloodGroup;

        const users = await User.find({
            ...filter,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(maxKm) * 1000
                }
            }
        }).limit(50).select('-password');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;