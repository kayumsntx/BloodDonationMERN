const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    // ========== বেসিক তথ্য ==========
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Security: ডিফল্ট কুয়েরিতে আসবে না
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120
    },
    dateOfBirth: {
        type: Date
    },

    // ========== ব্লাড ডোনেশন তথ্য ==========
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },

    // ========== ডোনেশন স্ট্যাটস ==========
    lastDonationDate: {
        type: Date,
        default: null
    },
    nextEligibleDate: {
        type: Date,
        default: null
    },
    totalDonations: {
        type: Number,
        default: 0
    },
    isDonorAvailable: {
        type: Boolean,
        default: false
    },
    badge: {
        type: String,
        enum: ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'None'
    },

    // ========== প্রোফাইল ==========
    profilePic: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxLength: 500,
        default: ''
    },

    // ========== Verification ==========
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // ========== Reset Password ==========
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ========== Two-Factor Auth ==========
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorOTP: String,
    twoFactorOTPExpire: Date,

    // ========== Online Status ==========
    isOnline: {
        type: Boolean,
        default: false
    },
    lastActive: {
        type: Date,
        default: Date.now
    },

    // ========== Role & Permissions ==========
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: String,

    // ========== Preferences & Notifications ==========
    language: {
        type: String,
        enum: ['bn', 'en'],
        default: 'bn'
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    fcmToken: {
        type: String,
        default: ''
    },
    notificationSettings: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
        digest: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
    },
    verification: {
        isVerified: { type: Boolean, default: false },
        type: { type: String, default: '' },
        documentUrl: { type: String, default: '' },
        submittedAt: Date,
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: String
    },
    twoFactorSecret: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Geo index for location-based search
UserSchema.index({ location: '2dsphere' });
UserSchema.index({ bloodGroup: 1, district: 1 });

// ========== Password হ্যাশ ==========
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ========== Password ম্যাচ ==========
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ========== Reset Password Token জেনারেট ==========
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // ১৫ মিনিট
    return resetToken;
};

// ========== Email Verification Token ==========
UserSchema.methods.getEmailVerificationToken = function() {
    const token = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // ২৪ ঘন্টা
    return token;
};

// ========== Badge ক্যালকুলেট ==========
UserSchema.methods.updateBadge = function() {
    const count = this.totalDonations;
    if (count >= 25) this.badge = 'Platinum';
    else if (count >= 10) this.badge = 'Gold';
    else if (count >= 4) this.badge = 'Silver';
    else if (count >= 1) this.badge = 'Bronze';
    else this.badge = 'None';
    return this.badge;
};

// ========== Next Eligible Date সেট ==========
UserSchema.methods.setNextEligibleDate = function() {
    if (this.lastDonationDate) {
        const next = new Date(this.lastDonationDate);
        next.setDate(next.getDate() + 90); // ৯০ দিন পরে
        this.nextEligibleDate = next;
    }
    return this.nextEligibleDate;
};

module.exports = mongoose.model('User', UserSchema);