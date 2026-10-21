import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SOSModal from './SOSModal';

const SOSButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [pressed, setPressed] = useState(false);
    const location = useLocation();
    const isChat = location.pathname.includes('/chat') || location.pathname.includes('/groups');

    const handlePress = () => {
        setPressed(true);
        setTimeout(() => {
            setShowModal(true);
            setPressed(false);
        }, 300);
    };

    const baseSize = isChat ? 54 : 70;
    const pressedSize = isChat ? 62 : 80;

    return (
        <>
            {/* Floating SOS Button */}
            <button
                onClick={handlePress}
                title="SOS - Emergency Blood Needed"
                style={{
                    position: 'fixed',
                    bottom: isChat ? 78 : 30,
                    right: isChat ? 16 : 30,
                    width: pressed ? pressedSize : baseSize,
                    height: pressed ? pressedSize : baseSize,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: 'white',
                    border: '3px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(231, 76, 60, 0.5)',
                    display: showModal ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    transition: 'all 0.3s',
                    fontSize: isChat ? '0.62em' : '0.7em',
                    fontWeight: 700,
                    letterSpacing: 1,
                    animation: 'sosPulse 2s infinite'
                }}
            >
                <span style={{ fontSize: isChat ? '1.2em' : '1.5em' }}>🚨</span>
                <span>SOS</span>
            </button>

            {/* Animation Keyframes */}
            <style>{`
                @keyframes sosPulse {
                    0%, 100% {
                        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 6px 30px rgba(231, 76, 60, 0.9);
                        transform: scale(1.08);
                    }
                }
            `}</style>

            {showModal && (
                <SOSModal onClose={() => setShowModal(false)} />
            )}
        </>
    );
};

export default SOSButton;
