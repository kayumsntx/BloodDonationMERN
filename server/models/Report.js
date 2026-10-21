const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for the report'],
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ post: 1 });

module.exports = mongoose.model('Report', ReportSchema);
