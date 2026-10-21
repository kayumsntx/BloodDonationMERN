const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: [true, 'Article content is required']
    },
    excerpt: {
        type: String,
        maxlength: 300,
        default: ''
    },
    category: {
        type: String,
        enum: [
            'Health & Medical',
            'Blood Donation',
            'Stories & Experiences',
            'Donor Guidelines',
            'Nutrition & Lifestyle',
            'General'
        ],
        default: 'Blood Donation'
    },
    tags: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorRole: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'],
        default: 'user'
    },
    isDoctorPost: {
        type: Boolean,
        default: false
    },
    credibilityBadge: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    views: {
        type: Number,
        default: 0
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            default: 'user'
        },
        text: {
            type: String,
            required: [true, 'Comment text is required'],
            maxlength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ author: 1 });

module.exports = mongoose.model('Post', PostSchema);
