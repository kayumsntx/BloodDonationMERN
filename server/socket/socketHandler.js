const User = require('../models/User');
const Message = require('../models/Message');
const GroupMessage = require('../models/GroupMessage');
const { saveMessage } = require('../routes/messages');

// ========== Online Status Tracking & Grace Period Management ==========
// Map of userId -> Set of socket IDs currently connected
const userSockets = new Map();
// Map of userId -> Disconnect grace period timer
const disconnectTimers = new Map();
// Grace period (5 seconds) to survive page reloads and brief network reconnects
const GRACE_PERIOD_MS = 5000;

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 New socket connected:', socket.id);

        // ========== User Join / Online Registration ==========
        socket.on('user-join', async (data) => {
            const { userId } = data || {};
            if (!userId) return;

            const strUserId = String(userId);
            socket.userId = strUserId;

            // 1. Cancel any pending disconnect timer for this user (reconnected before grace period expired)
            if (disconnectTimers.has(strUserId)) {
                clearTimeout(disconnectTimers.get(strUserId));
                disconnectTimers.delete(strUserId);
                console.log(`⏱️ Cancelled disconnect grace timer for user ${strUserId} (reconnected in time)`);
            }

            // 2. Track this socket in the user's active sockets set
            if (!userSockets.has(strUserId)) {
                userSockets.set(strUserId, new Set());
            }
            userSockets.get(strUserId).add(socket.id);

            // 3. Join the personal user room for targeted notifications & SOS alerts
            socket.join(strUserId);

            // 4. Update the user status to isOnline: true in database
            try {
                await User.findByIdAndUpdate(strUserId, {
                    isOnline: true,
                    lastActive: Date.now()
                });

                // 5. Broadcast fresh online users list to all connected clients
                const onlineUsers = await User.find({ isOnline: true }).select('-password');
                io.emit('online-users', onlineUsers);
            } catch (err) {
                console.error('Error updating user online status on join:', err.message);
            }

            // 6. Send recent public chat messages
            try {
                const messages = await Message.find({ type: 'public' })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .populate('sender', 'name profilePic');
                socket.emit('public-messages', messages.reverse());
            } catch (err) {
                console.error('Error sending public messages:', err.message);
            }
        });

        // ========== On-Demand Online Users Request ==========
        socket.on('get-online-users', async () => {
            try {
                const onlineUsers = await User.find({ isOnline: true }).select('-password');
                socket.emit('online-users', onlineUsers);
            } catch (err) {
                console.error('Error fetching online users on demand:', err.message);
            }
        });

        // ========== Explicit User Leave / Logout ==========
        socket.on('user-leave', async (data) => {
            const userId = data?.userId ? String(data.userId) : socket.userId;
            if (!userId) return;

            // Cancel any pending grace timer
            if (disconnectTimers.has(userId)) {
                clearTimeout(disconnectTimers.get(userId));
                disconnectTimers.delete(userId);
            }

            // Clear all socket tracking for this user
            userSockets.delete(userId);

            try {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastActive: Date.now()
                });
                const onlineUsers = await User.find({ isOnline: true }).select('-password');
                io.emit('online-users', onlineUsers);
                console.log(`🚪 User ${userId} logged out explicitly (immediate offline)`);
            } catch (err) {
                console.error('Error marking user offline on leave:', err.message);
            }
        });

        // ========== Heartbeat / Ping-Pong ==========
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // ========== Chat Messages Handlers ==========
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

        // ========== Group Chat Handlers ==========
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

        // ========== Delete Message Handlers ==========
        socket.on('delete-message', (data) => {
            const { messageId, type, toUserId } = data || {};
            if (type === 'private' && toUserId) {
                io.to(toUserId).emit('message-deleted', { messageId, type: 'private' });
                io.to(socket.userId).emit('message-deleted', { messageId, type: 'private' });
            } else {
                io.emit('message-deleted', { messageId, type: 'public' });
            }
        });

        socket.on('delete-group-message', (data) => {
            const { messageId, groupId } = data || {};
            if (groupId) {
                io.to(`group:${groupId}`).emit('group-message-deleted', { messageId, groupId });
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

        // ========== Disconnect Handler with Grace Period ==========
        socket.on('disconnect', async () => {
            const userId = socket.userId;
            console.log(`🔴 Socket disconnected: ${socket.id} (User: ${userId || 'anonymous'})`);

            if (!userId) return;

            // Remove this specific socket ID from the user's active sockets set
            if (userSockets.has(userId)) {
                userSockets.get(userId).delete(socket.id);
                if (userSockets.get(userId).size === 0) {
                    userSockets.delete(userId);
                }
            }

            // Check if user still has other active sockets (e.g. multiple tabs or newly reloaded tab)
            const hasRemainingSockets = userSockets.has(userId) && userSockets.get(userId).size > 0;
            if (hasRemainingSockets) {
                console.log(`ℹ️ User ${userId} still has active socket connection(s). Remaining online.`);
                return;
            }

            // User has 0 active sockets. Do NOT mark offline immediately!
            // Start a grace period timer to allow page reloads or temporary network reconnects.
            if (disconnectTimers.has(userId)) {
                clearTimeout(disconnectTimers.get(userId));
            }

            const timer = setTimeout(async () => {
                disconnectTimers.delete(userId);

                // Double check that user has not reconnected in the meantime
                const isStillDisconnected = !userSockets.has(userId) || userSockets.get(userId).size === 0;
                if (isStillDisconnected) {
                    try {
                        await User.findByIdAndUpdate(userId, {
                            isOnline: false,
                            lastActive: Date.now()
                        });
                        const onlineUsers = await User.find({ isOnline: true }).select('-password');
                        io.emit('online-users', onlineUsers);
                        console.log(`⚪ User ${userId} marked offline after ${GRACE_PERIOD_MS}ms grace period`);
                    } catch (err) {
                        console.error('Error marking user offline after grace period:', err.message);
                    }
                }
            }, GRACE_PERIOD_MS);

            disconnectTimers.set(userId, timer);
        });
    });
};