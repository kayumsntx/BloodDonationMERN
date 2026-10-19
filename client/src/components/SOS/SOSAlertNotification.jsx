import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SOSAlertNotification = ({ alert, onClose }) => {
    const navigate = useNavigate();
    const [responding, setResponding] = useState(false);

    const handleRespond = async () => {
        setResponding(true);
        try {
            await api.post(`/sos/${alert._id}/respond`, {
                message: "I'm on my way!"
            });
            toast.success('Response sent! Opening chat with requester...');
            onClose?.();
            navigate('/dashboard/chat');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to respond');
        } finally {
            setResponding(false);
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                background: 'white',
                borderRadius: 15,
                maxWidth: 400,
                width: 'calc(100% - 40px)',
                boxShadow: '0 10px 40px rgba(231, 76, 60, 0.4)',
                border: '3px solid #e74c3c',
                zIndex: 3000,
                animation: 'slideInRight 0.5s ease, shake 0.5s ease',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                color: 'white',
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.5em', animation: 'pulse 1s infinite' }}>🚨</span>
                    <div>
                        <div style={{ fontSize: '0.85em', fontWeight: 700, letterSpacing: 1 }}>
                            EMERGENCY SOS
                        </div>
                        <div style={{ fontSize: '0.7em', opacity: 0.9 }}>
                            Blood needed urgently!
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.3em',
                        cursor: 'pointer',
                        padding: 4
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <img
                        src={alert.requester?.profilePic ||
                            `https://ui-avatars.com/api/?name=${alert.requester?.name}&background=dc3545&color=fff&size=50`}
                        alt={alert.requester?.name}
                        style={{
                            width: 45,
                            height: 45,
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95em' }}>
                            {alert.requester?.name}
                        </div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                            needs <strong style={{ color: '#e74c3c' }}>{alert.bloodGroup}</strong> blood
                        </div>
                    </div>
                </div>

                <div style={{
                    background: '#fff5f5',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: '0.85em',
                    marginBottom: 12
                }}>
                    <div style={{ marginBottom: 4 }}>
                        🏥 <strong>{alert.hospital}</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        📍 {alert.district}
                    </div>
                    <div>
                        💉 {alert.units} unit(s) needed
                    </div>
                </div>

                {alert.message && (
                    <div style={{
                        fontSize: '0.85em',
                        color: '#666',
                        fontStyle: 'italic',
                        marginBottom: 12,
                        paddingLeft: 8,
                        borderLeft: '3px solid #e74c3c'
                    }}>
                        "{alert.message}"
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleRespond}
                        disabled={responding}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'linear-gradient(135deg, #28a745, #20c997)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: '0.9em',
                            cursor: responding ? 'not-allowed' : 'pointer',
                            opacity: responding ? 0.7 : 1
                        }}
                    >
                        {responding ? 'Sending...' : '🤝 I Can Help'}
                    </button>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '10px 15px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: '0.9em',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); }
                    to { transform: translateX(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default SOSAlertNotification;
