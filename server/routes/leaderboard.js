const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');
const { getBadgeInfo } = require('../utils/badges');

// ========== All-Time Leaderboard ==========
// GET /api/leaderboard/all-time?limit=20
router.get('/all-time', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const donors = await User.find({ totalDonations: { $gt: 0 } })
            .select('name profilePic bloodGroup district totalDonations badge')
            .sort({ totalDonations: -1 })
            .limit(limit);

        // Add rank and badge info
        const ranked = donors.map((donor, index) => ({
            rank: index + 1,
            _id: donor._id,
            name: donor.name,
            profilePic: donor.profilePic,
            bloodGroup: donor.bloodGroup,
            district: donor.district,
            totalDonations: donor.totalDonations,
            badge: donor.badge,
            badgeInfo: getBadgeInfo(donor.badge)
        }));

        // Find current user's rank
        const allDonors = await User.find({ totalDonations: { $gt: 0 } })
            .select('_id totalDonations')
            .sort({ totalDonations: -1 });
        
        const myRank = allDonors.findIndex(
            d => d._id.toString() === req.user._id.toString()
        ) + 1;

        res.json({
            leaderboard: ranked,
            myRank: myRank || null,
            totalDonors: allDonors.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Monthly Leaderboard ==========
// GET /api/leaderboard/monthly
router.get('/monthly', protect, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Aggregate donations by donor for this month
        const monthlyDonations = await Donation.aggregate([
            {
                $match: {
                    donatedAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: '$donor',
                    count: { $sum: 1 },
                    units: { $sum: '$units' }
                }
            },
            {
                $sort: { count: -1, units: -1 }
            },
            {
                $limit: 20
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    units: 1,
                    name: '$user.name',
                    profilePic: '$user.profilePic',
                    bloodGroup: '$user.bloodGroup',
                    district: '$user.district',
                    badge: '$user.badge'
                }
            }
        ]);

        const ranked = monthlyDonations.map((d, index) => ({
            rank: index + 1,
            _id: d._id,
            name: d.name,
            profilePic: d.profilePic,
            bloodGroup: d.bloodGroup,
            district: d.district,
            monthlyDonations: d.count,
            monthlyUnits: d.units,
            badge: d.badge,
            badgeInfo: getBadgeInfo(d.badge)
        }));

        res.json({
            month: startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            leaderboard: ranked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== By District Leaderboard ==========
// GET /api/leaderboard/district/:district
router.get('/district/:district', protect, async (req, res) => {
    try {
        const donors = await User.find({
            district: { $regex: req.params.district, $options: 'i' },
            totalDonations: { $gt: 0 }
        })
        .select('name profilePic bloodGroup district totalDonations badge')
        .sort({ totalDonations: -1 })
        .limit(10);

        const ranked = donors.map((donor, index) => ({
            rank: index + 1,
            ...donor.toObject(),
            badgeInfo: getBadgeInfo(donor.badge)
        }));

        res.json({
            district: req.params.district,
            leaderboard: ranked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Blood Group Leaderboard ==========
// GET /api/leaderboard/blood-group/:group
router.get('/blood-group/:group', protect, async (req, res) => {
    try {
        const donors = await User.find({
            bloodGroup: req.params.group,
            totalDonations: { $gt: 0 }
        })
        .select('name profilePic bloodGroup district totalDonations badge')
        .sort({ totalDonations: -1 })
        .limit(10);

        const ranked = donors.map((donor, index) => ({
            rank: index + 1,
            ...donor.toObject(),
            badgeInfo: getBadgeInfo(donor.badge)
        }));

        res.json({
            bloodGroup: req.params.group,
            leaderboard: ranked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
