const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');
const {
    BADGES,
    MILESTONES,
    getBadgeInfo,
    getNextMilestone,
    getProgressToNextBadge,
    getAllBadgesWithStatus
} = require('../utils/badges');

// ========== Get My Badges & Progress ==========
// GET /api/badges/my
router.get('/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const totalDonations = user.totalDonations || 0;

        const currentBadge = getBadgeInfo(user.badge);
        const nextMilestone = getNextMilestone(totalDonations);
        const progress = getProgressToNextBadge(totalDonations);
        const allBadges = getAllBadgesWithStatus(totalDonations);

        res.json({
            currentBadge: {
                key: user.badge,
                ...currentBadge
            },
            totalDonations,
            nextMilestone,
            progress,
            allBadges,
            milestones: MILESTONES
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get User's Badges (Public Profile) ==========
// GET /api/badges/user/:userId
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name profilePic bloodGroup totalDonations badge district');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentBadge = getBadgeInfo(user.badge);
        const progress = getProgressToNextBadge(user.totalDonations);
        const allBadges = getAllBadgesWithStatus(user.totalDonations);

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                profilePic: user.profilePic,
                bloodGroup: user.bloodGroup,
                district: user.district
            },
            currentBadge: {
                key: user.badge,
                ...currentBadge
            },
            totalDonations: user.totalDonations,
            progress,
            allBadges
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get All Milestones (Public) ==========
// GET /api/badges/milestones
router.get('/milestones', protect, (req, res) => {
    res.json(MILESTONES);
});

// ========== Get All Badge Types ==========
// GET /api/badges/all
router.get('/all', protect, (req, res) => {
    res.json(Object.keys(BADGES).map(key => ({
        key,
        ...BADGES[key]
    })));
});

module.exports = router;
