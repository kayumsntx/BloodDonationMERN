const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const { protect } = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');
const { checkMilestone } = require('../utils/badges');

// ========== Create a Donation Record (with eligibility check) ==========
// POST /api/donations
router.post('/', protect, async (req, res) => {
    try {
        const { recipient, request, bloodGroup, hospital, district, units, notes, overrideEligibility } = req.body;

        if (!bloodGroup || !hospital || !district) {
            return res.status(400).json({ message: 'Blood group, hospital, and district are required' });
        }

        // Check eligibility
        const user = await User.findById(req.user._id);
        const eligibility = checkEligibility(user);

        if (!eligibility.eligible && !overrideEligibility) {
            return res.status(400).json({
                message: eligibility.reason,
                eligibility,
                canOverride: true
            });
        }

        // Create donation
        const donation = await Donation.create({
            donor: req.user._id,
            recipient: recipient || null,
            request: request || null,
            bloodGroup,
            hospital,
            district,
            units: units || 1,
            notes: notes || ''
        });

        // Update donor's stats
        user.totalDonations += 1;
        user.lastDonationDate = new Date();
        user.setNextEligibleDate();
        user.updateBadge();
        await user.save();

        // If a blood request is linked, mark it as fulfilled
        if (request) {
            const bloodRequest = await BloodRequest.findById(request);
            if (bloodRequest) {
                bloodRequest.status = 'Fulfilled';
                bloodRequest.donor = req.user._id;
                await bloodRequest.save();
            }
        }

        const newEligibility = checkEligibility(user);
        const newMilestone = checkMilestone(user.totalDonations);

        await donation.populate('donor recipient', 'name profilePic bloodGroup');
        res.status(201).json({
            donation,
            nextEligibleDate: newEligibility.nextEligibleDate,
            daysRemaining: newEligibility.daysRemaining,
            totalDonations: user.totalDonations,
            newBadge: user.badge,
            milestone: newMilestone
        });
    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ========== Get My Donation History ==========
// GET /api/donations/my
router.get('/my', protect, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id })
            .sort({ donatedAt: -1 })
            .populate('recipient', 'name profilePic bloodGroup district')
            .populate('request', 'hospital district urgency bloodGroup');

        res.json({
            count: donations.length,
            donations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get My Donation Stats ==========
// GET /api/donations/stats
router.get('/stats', protect, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id });

        // Calculate stats
        const totalDonations = donations.length;
        const totalUnits = donations.reduce((sum, d) => sum + (d.units || 1), 0);

        // Donations by blood group
        const byBloodGroup = {};
        donations.forEach(d => {
            byBloodGroup[d.bloodGroup] = (byBloodGroup[d.bloodGroup] || 0) + 1;
        });

        // Donations by district
        const byDistrict = {};
        donations.forEach(d => {
            byDistrict[d.district] = (byDistrict[d.district] || 0) + 1;
        });

        // Donations by year
        const byYear = {};
        donations.forEach(d => {
            const year = new Date(d.donatedAt).getFullYear();
            byYear[year] = (byYear[year] || 0) + 1;
        });

        // First & last donation
        const firstDonation = donations.length > 0
            ? donations[donations.length - 1].donatedAt
            : null;
        const lastDonation = donations.length > 0
            ? donations[0].donatedAt
            : null;

        // Lives saved estimate (1 donation ≈ 3 lives)
        const livesSaved = totalDonations * 3;

        res.json({
            totalDonations,
            totalUnits,
            livesSaved,
            firstDonation,
            lastDonation,
            byBloodGroup,
            byDistrict,
            byYear
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Top Donors Leaderboard ==========
// GET /api/donations/leaderboard/top
router.get('/leaderboard/top', protect, async (req, res) => {
    try {
        const topDonors = await User.find({ totalDonations: { $gt: 0 } })
            .select('name profilePic bloodGroup district totalDonations badge')
            .sort({ totalDonations: -1 })
            .limit(20);

        res.json(topDonors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Donations by User (Public Profile) ==========
// GET /api/donations/user/:userId
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const donations = await Donation.find({
            donor: req.params.userId
        })
        .sort({ donatedAt: -1 })
        .populate('recipient', 'name profilePic');

        const user = await User.findById(req.params.userId)
            .select('name profilePic bloodGroup district totalDonations badge createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user,
            totalDonations: donations.length,
            donations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Donation by ID ==========
// GET /api/donations/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'name profilePic bloodGroup district phoneNumber email')
            .populate('recipient', 'name profilePic bloodGroup district')
            .populate('request', 'hospital district urgency bloodGroup quantity');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Only donor or recipient can see full details
        const isOwner = donation.donor._id.toString() === req.user._id.toString();
        const isRecipient = donation.recipient &&
            donation.recipient._id.toString() === req.user._id.toString();

        if (!isOwner && !isRecipient) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Update Donation (Only Donor) ==========
// PUT /api/donations/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { notes } = req.body;
        if (notes !== undefined) donation.notes = notes;

        await donation.save();
        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Delete Donation (Only Donor) ==========
// DELETE /api/donations/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await donation.deleteOne();

        // Recalculate user stats
        const donor = await User.findById(req.user._id);
        const remaining = await Donation.find({ donor: req.user._id })
            .sort({ donatedAt: -1 });

        donor.totalDonations = remaining.length;
        donor.lastDonationDate = remaining.length > 0 ? remaining[0].donatedAt : null;
        donor.setNextEligibleDate();
        donor.updateBadge();
        await donor.save();

        res.json({ message: 'Donation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
