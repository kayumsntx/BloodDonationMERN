import React, { useEffect, useState } from 'react';

const MilestoneCelebration = ({ milestone, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        // Auto-close after 8 seconds
        const timer = setTimeout(() => {
            onClose?.();
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    if (!milestone) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000,
                padding: 20,
                animation: 'fadeIn 0.5s ease'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.1); }
                }
                @keyframes confettiFall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>

            {/* Confetti */}
            {showConfetti && [...Array(30)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: -20,
                        left: `${Math.random() * 100}%`,
                        width: 8,
                        height: 8,
                        background: ['#dc3545', '#ffc107', '#28a745', '#17a2b8', '#e91e63'][i % 5],
                        borderRadius: i % 2 === 0 ? '50%' : '0',
                        animation: `confettiFall ${2 + Math.random() * 2}s linear infinite`,
                        animationDelay: `${Math.random()}s`,
                        pointerEvents: 'none'
                    }}
                />
            ))}

            <div
                style={{
                    background: 'white',
                    borderRadius: 20,
                    padding: '40px 30px',
                    maxWidth: 450,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'bounce 1s ease infinite alternate'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    fontSize: '5em',
                    marginBottom: 15,
                    animation: 'bounce 0.8s ease infinite alternate'
                }}>
                    {milestone.icon}
                </div>

                <div style={{
                    fontSize: '0.85em',
                    color: '#dc3545',
                    fontWeight: 700,
                    letterSpacing: 2,
                    marginBottom: 8
                }}>
                    🎉 MILESTONE REACHED 🎉
                </div>

                <h1 style={{
                    fontSize: '1.8em',
                    color: '#2c3e50',
                    marginBottom: 10
                }}>
                    {milestone.title}
                </h1>

                <p style={{
                    fontSize: '1em',
                    color: '#666',
                    marginBottom: 20,
                    lineHeight: 1.6
                }}>
                    {milestone.message}
                </p>

                <div style={{
                    background: 'linear-gradient(135deg, #fce4ec, #fff3cd)',
                    padding: '15px',
                    borderRadius: 12,
                    marginBottom: 20
                }}>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                        You've reached
                    </div>
                    <div style={{
                        fontSize: '2.5em',
                        fontWeight: 700,
                        color: '#dc3545',
                        lineHeight: 1
                    }}>
                        {milestone.count}
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#666', fontWeight: 600 }}>
                        donations 🩸
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: 14,
                        background: 'linear-gradient(135deg, #dc3545, #c82333)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: '1em',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    🙏 Thank You, Hero!
                </button>
            </div>
        </div>
    );
};

export default MilestoneCelebration;
