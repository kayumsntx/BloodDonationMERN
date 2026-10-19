const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['bloodGroup', 'district', 'custom'],
        default: 'bloodGroup'
    },
    bloodGroup: String,
    district: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    description: String,
    icon: String,
    isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
