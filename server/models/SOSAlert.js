const mongoose = require('mongoose');

const SOSAlertSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    patientName: {
        type: String,
        default: ''
    },
    hospital: {
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
            type: [Number],
            default: [0, 0]
        }
    },
    contactNumber: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        default: 1
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Fulfilled', 'Cancelled', 'Expired'],
        default: 'Active'
    },
    respondedDonors: [{
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: {
            type: Date,
            default: Date.now
        },
        message: String
    }],
    fulfilledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Auto-expire after 24 hours
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    notifiedDonors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

SOSAlertSchema.index({ location: '2dsphere' });
SOSAlertSchema.index({ status: 1, createdAt: -1 });
SOSAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if alert is expired
SOSAlertSchema.methods.isExpired = function() {
    return this.expiresAt < new Date();
};

// Check if user already responded
SOSAlertSchema.methods.hasResponded = function(userId) {
    return this.respondedDonors.some(
        r => r.donor.toString() === userId.toString()
    );
};

module.exports = mongoose.model('SOSAlert', SOSAlertSchema);
