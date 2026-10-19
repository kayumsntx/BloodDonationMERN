import React from 'react';
import { useNavigate } from 'react-router-dom';

const SOSResponseNotification = ({ response, onClose }) => {
    const navigate = useNavigate();

    const handleChat = () => {
        navigate('/dashboard/chat');
        onClose?.();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: 'white',
            borderRadius: 12,
            maxWidth: 380,
            width: 'calc(100% - 40px)',
            boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)',
            border: '3px solid #28a745',
            zIndex: 3000,
            animation: 'slideInRight 0.5s ease',
            overflow: 'hidden'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.5em' }}>🎉</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9em' }}>
                            A Donor Responded!
                        </div>
                        <div style={{ fontSize: '0.7em', opacity: 0.9 }}>
                            Someone can help with your SOS
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.3em',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{ padding: 15 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <img
                        src={response.donor?.profilePic ||
                            `https://ui-avatars.com/api/?name=${response.donor?.name}&background=28a745&color=fff&size=50`}
                        alt={response.donor?.name}
                        style={{
                            width: 45,
                            height: 45,
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{response.donor?.name}</div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                            🩸 {response.donor?.bloodGroup}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleChat}
                    style={{
                        width: '100%',
                        padding: 10,
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    💬 Chat Now
                </button>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default SOSResponseNotification;
