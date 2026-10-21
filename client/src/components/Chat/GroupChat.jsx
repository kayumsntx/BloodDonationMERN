import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import VoiceRecorder from './VoiceRecorder';
import ForwardModal from './ForwardModal';
import toast from 'react-hot-toast';
import './GroupChat.css';

const GroupChat = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const [showCommunities, setShowCommunities] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const { data } = await api.get('/groups/blood-groups');
            setGroups(data || []);
            // Auto-select user's blood group if member
            const recommended = (data || []).find(g => g.isRecommended && g.isMember);
            if (recommended) setActiveGroup(recommended);
            else if ((data || []).length > 0 && (data || [])[0].isMember) {
                setActiveGroup(data[0]);
            }
        } catch (error) {
            console.error('Failed to load blood groups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!socket || !activeGroup) return;

        socket.emit('join-group', activeGroup._id);

        api.get(`/groups/${activeGroup._id}/messages`)
            .then(r => setMessages(r.data || []))
            .catch(err => console.error(err));

        const handler = (msg) => {
            if (msg.group === activeGroup._id) {
                setMessages(prev => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        const deleteHandler = ({ messageId, groupId }) => {
            if (groupId === activeGroup._id) {
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
            }
        };

        socket.on('group-message', handler);
        socket.on('group-message-deleted', deleteHandler);
        return () => {
            socket.off('group-message', handler);
            socket.off('group-message-deleted', deleteHandler);
        };
    }, [socket, activeGroup]);

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

    const sendMessage = () => {
        if (!text.trim() || !socket || !activeGroup) return;
        socket.emit('group-message', { groupId: activeGroup._id, text: text.trim() });
        setText('');
    };

    const handleVoiceRecorded = ({ audio, audioDuration }) => {
        if (!socket || !activeGroup) return;
        socket.emit('group-message', {
            groupId: activeGroup._id,
            audio,
            audioDuration,
            text: '🎤 Voice note'
        });
        setShowVoiceRecorder(false);
    };

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
            await api.put(`/groups/messages/${msgId}/delete-for-me`);
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
            await api.delete(`/groups/messages/${msgId}`);
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
                socket.emit('delete-group-message', { messageId: msgId, groupId: activeGroup._id });
            }
            toast.success('Message deleted for everyone');
        } catch (error) {
            console.error('Delete for everyone error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete for everyone');
        }
    };

    const joinGroup = async (groupId) => {
        try {
            await api.post(`/groups/${groupId}/join`);
            setGroups(prev => prev.map(g => {
                if (g._id === groupId) {
                    const updated = { ...g, isMember: true, memberCount: g.memberCount + 1 };
                    setActiveGroup(updated);
                    return updated;
                }
                return g;
            }));
        } catch (error) {
            console.error('Failed to join group:', error);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="group-chat-container">
            {/* Left Sidebar: Blood Group Communities (Desktop side panel, Mobile slide-over drawer) */}
            <div
                className={`group-chat-sidebar ${showCommunities ? 'mobile-open' : ''}`}
                onClick={() => setShowCommunities(false)}
            >
                <div className="group-chat-sidebar-inner" onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#1e293b' }}>
                                🩸 Blood Group Communities
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                                Connect with donors having your same blood type
                            </p>
                        </div>
                        <button
                            type="button"
                            className="mobile-drawer-close-btn"
                            onClick={() => setShowCommunities(false)}
                            title="Close communities drawer"
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                        {loading && <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading groups...</div>}
                        {groups.map(g => {
                            const isActive = activeGroup?._id === g._id;
                            return (
                                <div
                                    key={g._id}
                                    onClick={() => {
                                        if (g.isMember) {
                                            setActiveGroup(g);
                                            setShowCommunities(false);
                                        }
                                    }}
                                    style={{
                                        padding: '12px 14px',
                                        background: isActive
                                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                            : '#f8fafc',
                                        color: isActive ? 'white' : '#1e293b',
                                        borderRadius: 12,
                                        marginBottom: 10,
                                        cursor: g.isMember ? 'pointer' : 'default',
                                        border: isActive ? 'none' : '1px solid #e2e8f0',
                                        transition: 'all 0.2s',
                                        boxShadow: isActive ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>{g.icon || '🩸'}</span>
                                            <span>{g.bloodGroup} Blood Group</span>
                                            {g.isRecommended && (
                                                <span
                                                    title="Your Blood Group"
                                                    style={{
                                                        fontSize: '0.7em',
                                                        background: isActive ? 'rgba(255,255,255,0.25)' : '#fef3c7',
                                                        color: isActive ? 'white' : '#b45309',
                                                        padding: '2px 6px',
                                                        borderRadius: 8,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    You ⭐
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        marginTop: 4,
                                        color: isActive ? 'rgba(255,255,255,0.85)' : '#64748b',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>👥 {g.memberCount} members</span>
                                        {!g.isMember && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    joinGroup(g._id);
                                                }}
                                                style={{
                                                    padding: '4px 12px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Join Group
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Area: Messages */}
            <div className="group-chat-main">
                {activeGroup ? (
                    <>
                        {/* Header with Communities Toggle Button */}
                        <div className="group-chat-header">
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <span>{activeGroup.icon || '🩸'}</span>
                                    <span>{activeGroup.name || `${activeGroup.bloodGroup} Blood Group`}</span>
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    {activeGroup.description || `Discussion for ${activeGroup.bloodGroup} donors and emergency needs`}
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <button
                                    type="button"
                                    className="communities-toggle-btn"
                                    onClick={() => setShowCommunities(v => !v)}
                                    title="View Blood Group Communities"
                                >
                                    🩸 Communities ▾
                                </button>
                                <span style={{
                                    fontSize: '0.8rem',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    fontWeight: 700,
                                    padding: '5px 10px',
                                    borderRadius: 12
                                }}>
                                    🩸 {activeGroup.bloodGroup}
                                </span>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 10 }}>💬</div>
                                    <h4 style={{ margin: '0 0 6px', color: '#475569' }}>No messages yet</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Be the first one to say hello to fellow {activeGroup.bloodGroup} donors!</p>
                                </div>
                            ) : (
                                messages.map((m, i) => {
                                    const isOwn = m.sender?._id === user?._id || m.sender === user?._id;
                                    const senderName = isOwn ? 'You' : m.sender?.name || 'Fellow Donor';
                                    const avatar = m.sender?.profilePic ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=dc3545&color=fff&size=40`;
                                    const isMenuOpen = activeMenuMsgId === m._id;
                                    const canDeleteEveryone = (isOwn || user?.role === 'admin') && !m.isDeleted;

                                    return (
                                        <div
                                            key={m._id || i}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isOwn ? 'flex-end' : 'flex-start',
                                                marginBottom: 14,
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '75%' }}>
                                                {!isOwn && (
                                                    <img
                                                        src={avatar}
                                                        alt={senderName}
                                                        style={{ width: 28, height: 28, borderRadius: '50%', marginBottom: 2 }}
                                                    />
                                                )}
                                                <div style={{
                                                    position: 'relative',
                                                    background: isOwn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'white',
                                                    color: isOwn ? 'white' : '#1e293b',
                                                    padding: '10px 16px',
                                                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                                    border: isOwn ? 'none' : '1px solid #e2e8f0',
                                                    minWidth: 140
                                                }}>
                                                    {/* Forwarded tag */}
                                                    {m.isForwarded && (
                                                        <div style={{
                                                            fontSize: '0.72rem',
                                                            fontStyle: 'italic',
                                                            opacity: 0.85,
                                                            marginBottom: 4,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}>
                                                            <span>↗️</span>
                                                            <span>Forwarded</span>
                                                        </div>
                                                    )}

                                                    {/* Header with name and action trigger */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                                                        {!isOwn ? (
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
                                                                {senderName}
                                                            </div>
                                                        ) : <div />}
                                                        <button
                                                            type="button"
                                                            title="Message options"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuMsgId(isMenuOpen ? null : m._id);
                                                            }}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                color: isOwn ? 'white' : '#64748b',
                                                                fontSize: '0.9rem',
                                                                opacity: 0.7,
                                                                lineHeight: 1,
                                                                padding: '2px 4px'
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>
                                                    </div>

                                                    {/* Dropdown menu */}
                                                    {isMenuOpen && (
                                                        <div
                                                            className="message-action-menu"
                                                            onClick={e => e.stopPropagation()}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 26,
                                                                right: isOwn ? 6 : 'auto',
                                                                left: isOwn ? 'auto' : 6,
                                                                background: 'white',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: 10,
                                                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                                zIndex: 100,
                                                                minWidth: 175,
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                flexDirection: 'column'
                                                            }}
                                                        >
                                                            {!m.isDeleted && m.text && (
                                                                <button
                                                                    type="button"
                                                                    className="action-menu-item"
                                                                    onClick={() => handleCopy(m)}
                                                                >
                                                                    <span>📋</span>
                                                                    <span>Copy SMS</span>
                                                                </button>
                                                            )}
                                                            {!m.isDeleted && (
                                                                <button
                                                                    type="button"
                                                                    className="action-menu-item"
                                                                    onClick={() => handleOpenForward(m)}
                                                                >
                                                                    <span>↗️</span>
                                                                    <span>Forward SMS</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="action-menu-item"
                                                                onClick={() => handleDeleteForMe(m._id)}
                                                            >
                                                                <span>🗑️</span>
                                                                <span>Delete for me</span>
                                                            </button>
                                                            {canDeleteEveryone && (
                                                                <button
                                                                    type="button"
                                                                    className="action-menu-item danger"
                                                                    onClick={() => handleDeleteForEveryone(m._id)}
                                                                >
                                                                    <span>💥</span>
                                                                    <span>Delete for everyone</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Content */}
                                                    {m.isDeleted ? (
                                                        <div style={{ fontStyle: 'italic', opacity: 0.75, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <span>🚫</span>
                                                            <span>This message was deleted</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {m.text && <div style={{ fontSize: '0.92rem', wordBreak: 'break-word', lineHeight: 1.4 }}>{m.text}</div>}
                                                            {m.audio && (
                                                                <div style={{ marginTop: 6 }}>
                                                                    <audio controls src={m.audio} style={{ maxWidth: '100%', height: 36 }} />
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        marginTop: 4,
                                                        textAlign: 'right',
                                                        color: isOwn ? 'rgba(255,255,255,0.75)' : '#94a3b8'
                                                    }}>
                                                        {formatTime(m.createdAt || Date.now())}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Voice recorder popup */}
                        {showVoiceRecorder && (
                            <div style={{ padding: '0 16px' }}>
                                <VoiceRecorder
                                    onRecorded={handleVoiceRecorded}
                                    onCancel={() => setShowVoiceRecorder(false)}
                                />
                            </div>
                        )}

                        {/* Input bar */}
                        <div className="group-chat-input-bar">
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
                                    minWidth: 40,
                                    cursor: 'pointer',
                                    fontSize: '1.1em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                🎤
                            </button>
                            <input
                                type="text"
                                className="group-chat-input"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder={`Message ${activeGroup.bloodGroup} community...`}
                            />
                            <button
                                type="button"
                                className="group-send-btn"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        color: '#64748b',
                        padding: 30,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🩸</div>
                        <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Select a Blood Group</h3>
                        <p style={{ margin: '0 0 18px', maxWidth: 360, fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Join your blood type group or browse other groups to connect with donors and coordinate blood donations.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCommunities(true)}
                            className="group-send-btn"
                            style={{ gap: 8, padding: '10px 22px' }}
                        >
                            🩸 Open Blood Group Communities
                        </button>
                    </div>
                )}
            </div>

            {/* Forward SMS Modal */}
            {forwardingMsg && (
                <ForwardModal
                    message={forwardingMsg}
                    source="group"
                    onClose={() => setForwardingMsg(null)}
                    onForwardSuccess={(type) => {
                        if (type === 'group' && socket && activeGroup) {
                            // Automatically updated via socket group-message
                        }
                    }}
                />
            )}
        </div>
    );
};

export default GroupChat;
