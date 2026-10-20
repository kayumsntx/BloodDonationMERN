import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ForwardModal = ({ message, source = 'direct', onClose, onForwardSuccess }) => {
    const [groups, setGroups] = useState([]);
    const [selectedTarget, setSelectedTarget] = useState({ type: 'public', id: null, name: 'Public Chat' });
    const [forwarding, setForwarding] = useState(false);

    useEffect(() => {
        api.get('/groups/blood-groups')
            .then(res => setGroups(res.data || []))
            .catch(err => console.error(err));
    }, []);

    const handleForward = async () => {
        if (!message) return;
        setForwarding(true);
        try {
            await api.post('/messages/forward', {
                messageId: message._id,
                source,
                targetType: selectedTarget.type,
                targetId: selectedTarget.id
            });
            toast.success(`Forwarded to ${selectedTarget.name}! 🚀`);
            onForwardSuccess?.(selectedTarget.type, selectedTarget.id);
            onClose();
        } catch (error) {
            console.error('Forward failed:', error);
            toast.error(error.response?.data?.message || 'Failed to forward message');
        } finally {
            setForwarding(false);
        }
    };

    if (!message) return null;

    const previewText = message.text || (message.audio ? '🎤 Voice message' : (message.image ? '📷 Image' : 'Message'));

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: 16,
                maxWidth: 440,
                width: '100%',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
                        Forward Message ↗️
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9', border: 'none', borderRadius: '50%',
                            width: 32, height: 32, cursor: 'pointer', color: '#64748b'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Message preview snippet */}
                <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #dc2626',
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: '0.9rem',
                    color: '#475569',
                    fontStyle: 'italic',
                    maxHeight: 70,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    "{previewText}"
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
                    Select destination:
                </div>

                <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {/* Public Chat option */}
                    <div
                        onClick={() => setSelectedTarget({ type: 'public', id: null, name: 'Public Chat' })}
                        style={{
                            padding: '12px 14px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: selectedTarget.type === 'public' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                            background: selectedTarget.type === 'public' ? '#fef2f2' : 'white'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.3rem' }}>💬</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>Public Chat Room</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>All active members</div>
                            </div>
                        </div>
                        {selectedTarget.type === 'public' && <span style={{ color: '#dc2626', fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Blood Groups */}
                    {groups.map(g => {
                        const isSelected = selectedTarget.type === 'group' && selectedTarget.id === g._id;
                        return (
                            <div
                                key={g._id}
                                onClick={() => setSelectedTarget({ type: 'group', id: g._id, name: `${g.bloodGroup} Group` })}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: isSelected ? '2px solid #dc2626' : '1px solid #e2e8f0',
                                    background: isSelected ? '#fef2f2' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: '1.3rem' }}>{g.icon || '🩸'}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{g.bloodGroup} Blood Group</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{g.memberCount} members</div>
                                    </div>
                                </div>
                                {isSelected && <span style={{ color: '#dc2626', fontWeight: 700 }}>✓</span>}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '11px', background: '#f1f5f9',
                            border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#475569'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={forwarding}
                        onClick={handleForward}
                        style={{
                            flex: 2, padding: '11px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', color: 'white'
                        }}
                    >
                        {forwarding ? 'Forwarding...' : `Forward to ${selectedTarget.name}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;
