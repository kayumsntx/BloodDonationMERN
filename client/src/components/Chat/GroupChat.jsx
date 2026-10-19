import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import VoiceRecorder from './VoiceRecorder';

const GroupChat = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
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

        socket.on('group-message', handler);
        return () => {
            socket.off('group-message', handler);
        };
    }, [socket, activeGroup]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
        <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: 20,
            height: 'calc(100vh - 140px)',
            minHeight: 520
        }}>
            {/* Left Sidebar: Groups List */}
            <div style={{
                background: 'white',
                borderRadius: 16,
                padding: '20px 16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#1e293b' }}>
                        🩸 Blood Group Communities
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        Connect with donors having your same blood type
                    </p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                    {loading && <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading groups...</div>}
                    {groups.map(g => {
                        const isActive = activeGroup?._id === g._id;
                        return (
                            <div
                                key={g._id}
                                onClick={() => {
                                    if (g.isMember) setActiveGroup(g);
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

            {/* Right Area: Messages */}
            <div style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {activeGroup ? (
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #e2e8f0',
                            background: '#fafafa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{activeGroup.icon || '🩸'}</span>
                                    <span>{activeGroup.name || `${activeGroup.bloodGroup} Blood Group`}</span>
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    {activeGroup.description || `Discussion for ${activeGroup.bloodGroup} donors and emergency needs`}
                                </p>
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: 12
                            }}>
                                🩸 {activeGroup.bloodGroup}
                            </span>
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

                                    return (
                                        <div
                                            key={m._id || i}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isOwn ? 'flex-end' : 'flex-start',
                                                marginBottom: 14
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
                                                    background: isOwn ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'white',
                                                    color: isOwn ? 'white' : '#1e293b',
                                                    padding: '10px 16px',
                                                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                                    border: isOwn ? 'none' : '1px solid #e2e8f0'
                                                }}>
                                                    {!isOwn && (
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>
                                                            {senderName}
                                                        </div>
                                                    )}
                                                    {m.text && <div style={{ fontSize: '0.92rem', wordBreak: 'break-word', lineHeight: 1.4 }}>{m.text}</div>}
                                                    {m.audio && (
                                                        <div style={{ marginTop: 6 }}>
                                                            <audio controls src={m.audio} style={{ maxWidth: '100%', height: 36 }} />
                                                        </div>
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
                        <div style={{
                            padding: '14px 18px',
                            borderTop: '1px solid #e2e8f0',
                            background: 'white',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center'
                        }}>
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
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder={`Message ${activeGroup.bloodGroup} community...`}
                                style={{
                                    flex: 1,
                                    padding: '10px 18px',
                                    borderRadius: 24,
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    fontSize: '0.92rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={sendMessage}
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 24,
                                    padding: '10px 22px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                }}
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
                        padding: 40
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🩸</div>
                        <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Select a Blood Group</h3>
                        <p style={{ margin: 0, textAlign: 'center', maxWidth: 360, fontSize: '0.9rem' }}>
                            Join your blood type group or browse other groups to connect with donors and coordinate blood donations.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupChat;
