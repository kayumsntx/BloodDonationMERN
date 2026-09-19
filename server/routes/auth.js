const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, gender, age, bloodGroup, phoneNumber, district } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            gender,
            age,
            bloodGroup,
            phoneNumber,
            district
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bloodGroup: user.bloodGroup,
            profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=dc3545&color=fff&size=100`,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bloodGroup: user.bloodGroup,
            profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=dc3545&color=fff&size=100`,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;