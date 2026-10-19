const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: String,
    image: String,
    audio: String,
    audioDuration: Number,
    isGif: Boolean
}, { timestamps: true });

GroupMessageSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);
