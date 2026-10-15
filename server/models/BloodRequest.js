const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientName: {
        type: String,
        default: ''
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 20
    },
    hospital: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Normal', 'Urgent', 'Emergency', 'Critical'],
        default: 'Normal'
    },
    description: {
        type: String,
        default: ''
    },
    contactNumber: {
        type: String,
        default: ''
    },
    neededBy: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Fulfilled', 'Cancelled', 'Expired', 'Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Open'
    },
    donorsResponded: [{
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

BloodRequestSchema.index({ bloodGroup: 1, district: 1, status: 1 });
BloodRequestSchema.index({ urgency: -1, createdAt: -1 });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);