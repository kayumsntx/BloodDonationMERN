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
    audio: {
        type: String,
        default: ''
    },
    audioDuration: {
        type: Number,
        default: 0
    },
    isGif: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    isForwarded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);