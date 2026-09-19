const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Get public messages
router.get('/public', protect, async (req, res) => {
    try {
        const messages = await Message.find({ type: 'public' })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name profilePic');

        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get private messages between two users
router.get('/private/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            type: 'private',
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender receiver', 'name profilePic');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save message (used by socket)
const saveMessage = async (data) => {
    try {
        const message = await Message.create(data);
        return message;
    } catch (error) {
        console.error('Error saving message:', error);
        return null;
    }
};

module.exports = { saveMessage, router };