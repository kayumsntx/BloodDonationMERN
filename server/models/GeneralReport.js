const mongoose = require('mongoose');

const GeneralReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    name: {
        type: String,
        default: 'Anonymous'
    },
    email: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        enum: ['technical_issue', 'fake_profile', 'spam', 'feedback', 'other'],
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

GeneralReportSchema.index({ status: 1, createdAt: -1 });
GeneralReportSchema.index({ category: 1 });

module.exports = mongoose.model('GeneralReport', GeneralReportSchema);
