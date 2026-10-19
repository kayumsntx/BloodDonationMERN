import React, { useState } from 'react';
import SOSModal from './SOSModal';

const SOSButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [pressed, setPressed] = useState(false);

    const handlePress = () => {
        setPressed(true);
        setTimeout(() => {
            setShowModal(true);
            setPressed(false);
        }, 300);
    };

    return (
        <>
            {/* Floating SOS Button */}
            <button
                onClick={handlePress}
                title="SOS - Emergency Blood Needed"
                style={{
                    position: 'fixed',
                    bottom: 30,
                    right: 30,
                    width: pressed ? 80 : 70,
                    height: pressed ? 80 : 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: 'white',
                    border: '4px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(231, 76, 60, 0.5)',
                    display: showModal ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    transition: 'all 0.3s',
                    fontSize: '0.7em',
                    fontWeight: 700,
                    letterSpacing: 1,
                    animation: 'sosPulse 2s infinite'
                }}
            >
                <span style={{ fontSize: '1.5em' }}>🚨</span>
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
