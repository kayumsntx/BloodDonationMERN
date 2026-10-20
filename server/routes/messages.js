const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const GroupMessage = require('../models/GroupMessage');
const { protect } = require('../middleware/auth');

// Get public messages (excluding messages deleted for current user)
router.get('/public', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            type: 'public',
            deletedFor: { $ne: req.user._id }
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name profilePic');

        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get private messages between two users (excluding messages deleted for current user)
router.get('/private/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            type: 'private',
            deletedFor: { $ne: req.user._id },
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

// Delete message for me
router.put('/:id/delete-for-me', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await Message.findByIdAndUpdate(req.params.id, {
            $addToSet: { deletedFor: req.user._id }
        });

        res.json({ success: true, messageId: req.params.id, action: 'deleteForMe' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete message for everyone (only author or admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const isSender = message.sender.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isSender && !isAdmin) {
            return res.status(403).json({ message: 'You can only delete your own messages for everyone' });
        }

        message.isDeleted = true;
        message.text = '🚫 This message was deleted';
        message.image = '';
        message.audio = '';
        message.audioDuration = 0;
        await message.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('message-deleted', {
                messageId: message._id,
                type: message.type,
                receiver: message.receiver,
                isDeletedForEveryone: true
            });
        }

        res.json({ success: true, messageId: message._id, action: 'deleteForEveryone', message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Forward message
router.post('/forward', protect, async (req, res) => {
    try {
        const { messageId, source, targetType, targetId } = req.body;
        // source can be 'direct' or 'group'
        let originalMsg = null;
        if (source === 'group') {
            originalMsg = await GroupMessage.findById(messageId);
        } else {
            originalMsg = await Message.findById(messageId);
        }

        if (!originalMsg || originalMsg.isDeleted) {
            return res.status(404).json({ message: 'Original message not found or deleted' });
        }

        const io = req.app.get('io');
        let forwardedMsg = null;

        if (targetType === 'group') {
            forwardedMsg = await GroupMessage.create({
                group: targetId,
                sender: req.user._id,
                text: originalMsg.text,
                image: originalMsg.image,
                audio: originalMsg.audio,
                audioDuration: originalMsg.audioDuration,
                isGif: originalMsg.isGif,
                isForwarded: true
            });
            await forwardedMsg.populate('sender', 'name profilePic');
            if (io) {
                io.to(`group:${targetId}`).emit('group-message', forwardedMsg);
            }
        } else if (targetType === 'private') {
            forwardedMsg = await Message.create({
                sender: req.user._id,
                receiver: targetId,
                text: originalMsg.text,
                image: originalMsg.image,
                audio: originalMsg.audio,
                audioDuration: originalMsg.audioDuration,
                isGif: originalMsg.isGif,
                type: 'private',
                isForwarded: true
            });
            await forwardedMsg.populate('sender receiver', 'name profilePic');
            if (io) {
                io.to(req.user._id.toString()).emit('message', forwardedMsg);
                io.to(targetId.toString()).emit('message', forwardedMsg);
            }
        } else {
            // Default: public
            forwardedMsg = await Message.create({
                sender: req.user._id,
                text: originalMsg.text,
                image: originalMsg.image,
                audio: originalMsg.audio,
                audioDuration: originalMsg.audioDuration,
                isGif: originalMsg.isGif,
                type: 'public',
                isForwarded: true
            });
            await forwardedMsg.populate('sender', 'name profilePic');
            if (io) {
                io.emit('message', forwardedMsg);
            }
        }

        res.json({ success: true, message: forwardedMsg });
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