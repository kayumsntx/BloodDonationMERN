const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isGif: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);