const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

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

module.exports = router;