import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Chat.css';

const ChatArea = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('public-messages', (msgs) => setMessages(msgs));
        socket.on('message', (msg) => {
            if (msg.type === 'public') {
                setMessages(prev => [...prev, msg]);
            }
        });
        socket.on('online-users', (users) => setOnlineUsers(users));
        socket.on('user-typing', ({ from, isTyping }) => {
            setTypingUsers(prev => ({ ...prev, [from]: isTyping }));
        });

        return () => {
            socket.off('public-messages');
            socket.off('message');
            socket.off('online-users');
            socket.off('user-typing');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!text.trim() || !socket) return;
        socket.emit('chat-message', { text: text.trim() });
        setText('');
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing', { isTyping: true });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const typingList = Object.keys(typingUsers).filter(id => typingUsers[id]);

    return (
        <div className="chat-wrapper">
            <div className="chat-sidebar">
                <h3>Online ({onlineUsers.length})</h3>
                {onlineUsers.map(u => (
                    <div className="online-user-item" key={u._id}>
                        <img
                            src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=dc3545&color=fff&size=50`}
                            alt={u.name}
                        />
                        <div className="user-info">
                            <div className="name">{u.name}</div>
                            <div className="status">🟢 {u.bloodGroup}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-main">
                <div className="chat-header">
                    <h3>💬 Public Chat Room</h3>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                            <div style={{ fontSize: '3em', marginBottom: 10 }}>💬</div>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                        const senderName = isOwn ? 'You' : msg.sender?.name || 'Unknown';
                        const avatarUrl = msg.sender?.profilePic ||
                            `https://ui-avatars.com/api/?name=${senderName}&background=dc3545&color=fff&size=40`;

                        return (
                            <div
                                key={idx}
                                className={`chat-message ${isOwn ? 'own' : 'other'}`}
                            >
                                {!isOwn && <div className="sender">{senderName}</div>}
                                <div>{msg.text}</div>
                                <div className="time">{formatTime(msg.createdAt || Date.now())}</div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {typingList.length > 0 && (
                    <div style={{ padding: '5px 20px', fontSize: '0.8em', color: '#666', fontStyle: 'italic' }}>
                        {typingList.length} user(s) typing...
                    </div>
                )}

                <div className="chat-input-area">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onInput={handleTyping}
                        placeholder="Type a message..."
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
