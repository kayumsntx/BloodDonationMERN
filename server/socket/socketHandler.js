const User = require('../models/User');
const Message = require('../models/Message');
const GroupMessage = require('../models/GroupMessage');
const { saveMessage } = require('../routes/messages');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 New socket connected:', socket.id);

        socket.on('user-join', async (data) => {
            const { userId } = data || {};
            if (!userId) return;
            socket.userId = userId;

            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastActive: Date.now()
            });

            socket.join(userId);

            const onlineUsers = await User.find({ isOnline: true }).select('-password');
            io.emit('online-users', onlineUsers);

            const messages = await Message.find({ type: 'public' })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('sender', 'name profilePic');
            socket.emit('public-messages', messages.reverse());
        });

        socket.on('chat-message', async (data) => {
            const { text, image, isGif, audio, audioDuration } = data || {};
            const message = await saveMessage({
                sender: socket.userId,
                text,
                image,
                isGif,
                audio,
                audioDuration,
                type: 'public'
            });

            const populated = await message.populate('sender', 'name profilePic');
            io.emit('message', populated);
        });

        socket.on('private-message', async (data) => {
            const { toUserId, text, image, isGif, audio, audioDuration } = data || {};
            const message = await saveMessage({
                sender: socket.userId,
                receiver: toUserId,
                text,
                image,
                isGif,
                audio,
                audioDuration,
                type: 'private'
            });

            const populated = await message.populate('sender receiver', 'name profilePic');
            io.to(socket.userId).emit('message', populated);
            if (toUserId) {
                io.to(toUserId).emit('message', populated);
            }
        });

        socket.on('typing', (data) => {
            const { to, isTyping } = data || {};
            if (to) {
                socket.broadcast.to(to).emit('user-typing', {
                    from: socket.userId,
                    isTyping
                });
            } else {
                socket.broadcast.emit('user-typing', {
                    from: socket.userId,
                    isTyping
                });
            }
        });

        // ========== Group Chat Handlers (Day 13) ==========
        socket.on('join-group', (groupId) => {
            if (groupId) {
                socket.join(`group:${groupId}`);
            }
        });

        socket.on('group-message', async (data) => {
            try {
                const { groupId, text, image, audio, audioDuration } = data || {};
                if (!groupId || (!text && !image && !audio)) return;

                const msg = await GroupMessage.create({
                    group: groupId,
                    sender: socket.userId,
                    text,
                    image,
                    audio,
                    audioDuration
                });
                const populated = await msg.populate('sender', 'name profilePic');
                io.to(`group:${groupId}`).emit('group-message', populated);
            } catch (err) {
                console.error('Group message error:', err.message);
            }
        });

        // ========== SOS Alert Handlers ==========
        socket.on('sos-respond', async (data) => {
            const { sosId, requesterId, message } = data || {};
            if (requesterId) {
                io.to(requesterId).emit('sos-response', {
                    sosId,
                    donor: {
                        _id: socket.userId,
                        message: message || 'I can help!'
                    },
                    respondedAt: new Date()
                });
            }
        });

        socket.on('sos-cancel', async (data) => {
            const { sosId } = data || {};
            io.emit('sos-cancelled', { sosId });
        });

        socket.on('disconnect', async () => {
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastActive: Date.now()
                });

                const onlineUsers = await User.find({ isOnline: true }).select('-password');
                io.emit('online-users', onlineUsers);
            }
            console.log('🔴 Socket disconnected:', socket.id);
        });
    });
};