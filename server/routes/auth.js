const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
    sendPasswordResetEmail, 
    sendVerificationEmail 
} = require('../utils/emailService');

// ========== টোকেন জেনারেট ==========
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========== Response ফরম্যাট ==========
const userResponse = (user, token) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    age: user.age,
    bloodGroup: user.bloodGroup,
    phoneNumber: user.phoneNumber,
    district: user.district,
    address: user.address || '',
    profilePic: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc3545&color=fff&size=100`,
    totalDonations: user.totalDonations || 0,
    lastDonationDate: user.lastDonationDate || null,
    nextEligibleDate: user.nextEligibleDate || null,
    badge: user.badge || 'None',
    isDonorAvailable: user.isDonorAvailable || false,
    isVerified: user.isVerified || false,
    isEmailVerified: user.isEmailVerified || false,
    role: user.role || 'user',
    bio: user.bio || '',
    createdAt: user.createdAt,
    ...(token ? { token } : {})
});

// ========== Register ==========
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, gender, age, bloodGroup, phoneNumber, district } = req.body;

        if (!name || !email || !password || !gender || !age || !bloodGroup || !phoneNumber || !district) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            gender,
            age,
            bloodGroup,
            phoneNumber,
            district
        });

        // Email Verification টোকেন
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Verification Email পাঠান
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;
        await sendVerificationEmail(user.email, verifyUrl, user.name);

        const token = generateToken(user._id);
        res.status(201).json(userResponse(user, token));
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ========== Login ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ 
                message: 'Account blocked', 
                reason: user.blockedReason 
            });
        }

        user.isOnline = true;
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);
        res.json(userResponse(user, token));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Forgot Password ==========
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const result = await sendPasswordResetEmail(user.email, resetUrl, user.name);
        if (!result.success && result.error && !result.message) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }

        res.json({ message: 'Password reset email sent!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Reset Password ==========
router.put('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({ message: 'Password reset successful', ...userResponse(user, token) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Verify Email ==========
router.get('/verify-email/:token', async (req, res) => {
    try {
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Get Me ==========
router.get('/me', protect, async (req, res) => {
    res.json(userResponse(req.user));
});

// ========== Logout ==========
router.post('/logout', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: false,
            lastActive: new Date()
        });
        res.json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== Resend Verification Email ==========
router.post('/resend-verification', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;
        await sendVerificationEmail(user.email, verifyUrl, user.name);

        res.json({ message: 'Verification email sent!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;