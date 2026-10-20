import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import VoiceRecorder from './VoiceRecorder';
import ForwardModal from './ForwardModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Chat.css';

const ChatArea = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const messagesEndRef = useRef(null);

    const handleVoiceRecorded = ({ audio, audioDuration }) => {
        if (!socket) return;
        socket.emit('chat-message', { audio, audioDuration, text: '🎤 Voice message' });
        setShowVoiceRecorder(false);
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('public-messages', (msgs) => setMessages(msgs));
        socket.on('message', (msg) => {
            if (msg.type === 'public') {
                setMessages(prev => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        });
        socket.on('message-deleted', ({ messageId }) => {
            setMessages(prev => prev.map(m => {
                if (m._id === messageId) {
                    return {
                        ...m,
                        isDeleted: true,
                        text: '🚫 This message was deleted',
                        audio: '',
                        image: ''
                    };
                }
                return m;
            }));
        });
        socket.on('online-users', (users) => setOnlineUsers(users));
        socket.on('user-typing', ({ from, isTyping }) => {
            setTypingUsers(prev => ({ ...prev, [from]: isTyping }));
        });

        return () => {
            socket.off('public-messages');
            socket.off('message');
            socket.off('message-deleted');
            socket.off('online-users');
            socket.off('user-typing');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close action menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuMsgId(null);
        if (activeMenuMsgId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeMenuMsgId]);

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

    // Actions on messages: Copy, Forward, Delete for me, Delete for everyone
    const handleCopy = (msg) => {
        setActiveMenuMsgId(null);
        if (msg.text) {
            navigator.clipboard.writeText(msg.text);
            toast.success('Message copied to clipboard! 📋');
        } else {
            toast.error('No text content to copy');
        }
    };

    const handleOpenForward = (msg) => {
        setActiveMenuMsgId(null);
        setForwardingMsg(msg);
    };

    const handleDeleteForMe = async (msgId) => {
        setActiveMenuMsgId(null);
        try {
            await api.put(`/messages/${msgId}/delete-for-me`);
            setMessages(prev => prev.filter(m => m._id !== msgId));
            toast.success('Message deleted for you');
        } catch (error) {
            console.error('Delete for me error:', error);
            toast.error('Failed to delete message');
        }
    };

    const handleDeleteForEveryone = async (msgId) => {
        setActiveMenuMsgId(null);
        if (!window.confirm('Are you sure you want to delete this message for everyone?')) {
            return;
        }

        try {
            await api.delete(`/messages/${msgId}`);
            setMessages(prev => prev.map(m => {
                if (m._id === msgId) {
                    return {
                        ...m,
                        isDeleted: true,
                        text: '🚫 This message was deleted',
                        audio: '',
                        image: ''
                    };
                }
                return m;
            }));
            if (socket) {
                socket.emit('delete-message', { messageId: msgId, type: 'public' });
            }
            toast.success('Message deleted for everyone');
        } catch (error) {
            console.error('Delete for everyone error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete for everyone');
        }
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
                        const isMenuOpen = activeMenuMsgId === msg._id;
                        const canDeleteEveryone = (isOwn || user?.role === 'admin') && !msg.isDeleted;

                        return (
                            <div
                                key={msg._id || idx}
                                className={`chat-message ${isOwn ? 'own' : 'other'}`}
                            >
                                {/* Forwarded badge */}
                                {msg.isForwarded && (
                                    <div className="forwarded-badge">
                                        <span>↗️</span>
                                        <span>Forwarded</span>
                                    </div>
                                )}

                                {/* Sender & action menu trigger */}
                                <div className="message-header-row">
                                    {!isOwn && <div className="sender">{senderName}</div>}
                                    <div style={{ marginLeft: 'auto' }}>
                                        <button
                                            type="button"
                                            className="message-action-btn"
                                            title="Message options"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuMsgId(isMenuOpen ? null : msg._id);
                                            }}
                                        >
                                            ⋮
                                        </button>
                                    </div>
                                </div>

                                {/* Action dropdown menu */}
                                {isMenuOpen && (
                                    <div
                                        className="message-action-menu"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {!msg.isDeleted && msg.text && (
                                            <button
                                                type="button"
                                                className="action-menu-item"
                                                onClick={() => handleCopy(msg)}
                                            >
                                                <span>📋</span>
                                                <span>Copy SMS</span>
                                            </button>
                                        )}
                                        {!msg.isDeleted && (
                                            <button
                                                type="button"
                                                className="action-menu-item"
                                                onClick={() => handleOpenForward(msg)}
                                            >
                                                <span>↗️</span>
                                                <span>Forward SMS</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="action-menu-item"
                                            onClick={() => handleDeleteForMe(msg._id)}
                                        >
                                            <span>🗑️</span>
                                            <span>Delete for me</span>
                                        </button>
                                        {canDeleteEveryone && (
                                            <button
                                                type="button"
                                                className="action-menu-item danger"
                                                onClick={() => handleDeleteForEveryone(msg._id)}
                                            >
                                                <span>💥</span>
                                                <span>Delete for everyone</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Message Content */}
                                {msg.isDeleted ? (
                                    <div className="deleted-text">
                                        <span>🚫</span>
                                        <span>This message was deleted</span>
                                    </div>
                                ) : (
                                    <>
                                        {msg.text && <div>{msg.text}</div>}
                                        {msg.audio && (
                                            <div style={{ marginTop: 6 }}>
                                                <audio controls src={msg.audio} style={{ maxWidth: '100%', height: 38 }} />
                                            </div>
                                        )}
                                    </>
                                )}

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

                {showVoiceRecorder && (
                    <div style={{ padding: '0 20px' }}>
                        <VoiceRecorder
                            onRecorded={handleVoiceRecorded}
                            onCancel={() => setShowVoiceRecorder(false)}
                        />
                    </div>
                )}

                <div className="chat-input-area">
                    <button
                        type="button"
                        onClick={() => setShowVoiceRecorder(v => !v)}
                        title="Voice message"
                        style={{
                            background: showVoiceRecorder ? '#dc2626' : '#f1f5f9',
                            color: showVoiceRecorder ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            cursor: 'pointer',
                            fontSize: '1.1em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        🎤
                    </button>
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

            {/* Forward SMS Modal */}
            {forwardingMsg && (
                <ForwardModal
                    message={forwardingMsg}
                    source="direct"
                    onClose={() => setForwardingMsg(null)}
                    onForwardSuccess={(type) => {
                        if (type === 'public') {
                            // Already broadcast via socket
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ChatArea;
