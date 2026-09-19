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
            description
        });

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

        if (request.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status || request.status;
        if (donor) request.donor = donor;

        // If fulfilled, update donor's donation count
        if (status === 'Fulfilled' && donor) {
            const donorUser = await User.findById(donor);
            donorUser.totalDonations += 1;
            donorUser.lastDonationDate = new Date();
            await donorUser.save();
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;