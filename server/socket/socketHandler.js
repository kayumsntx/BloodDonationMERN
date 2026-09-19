const User = require('../models/User');
const Message = require('../models/Message');
const { saveMessage } = require('../routes/messages');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 New socket connected:', socket.id);

        socket.on('user-join', async (data) => {
            const { userId } = data;
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
            const { text, image, isGif } = data;
            const message = await saveMessage({
                sender: socket.userId,
                text,
                image,
                isGif,
                type: 'public'
            });

            const populated = await message.populate('sender', 'name profilePic');
            io.emit('message', populated);
        });

        socket.on('private-message', async (data) => {
            const { toUserId, text, image, isGif } = data;
            const message = await saveMessage({
                sender: socket.userId,
                receiver: toUserId,
                text,
                image,
                isGif,
                type: 'private'
            });

            const populated = await message.populate('sender receiver', 'name profilePic');
            io.to(socket.userId).emit('message', populated);
            io.to(toUserId).emit('message', populated);
        });

        socket.on('typing', (data) => {
            const { to, isTyping } = data;
            socket.broadcast.to(to).emit('user-typing', {
                from: socket.userId,
                isTyping
            });
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