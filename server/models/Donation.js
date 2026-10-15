const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodRequest'
    },
    bloodGroup: {
        type: String,
        required: true
    },
    hospital: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        default: 1
    },
    donatedAt: {
        type: Date,
        default: Date.now
    },
    certificateId: {
        type: String,
        unique: true,
        sparse: true
    },
    notes: String,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Certificate ID জেনারেট
DonationSchema.pre('save', function(next) {
    if (!this.certificateId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.certificateId = `BD-${timestamp}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Donation', DonationSchema);
