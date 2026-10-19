import React from 'react';

const BadgeProgress = ({ progress, currentBadge }) => {
    if (!progress) return null;

    const { current, target, progress: percent, remaining, nextMilestone } = progress;

    if (!nextMilestone) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 20,
                background: 'linear-gradient(135deg, #ffd70022, #ffd70044)',
                borderRadius: 12,
                border: '2px solid #ffd700'
            }}>
                <div style={{ fontSize: '3em', marginBottom: 10 }}>👑</div>
                <h3 style={{ color: '#b8860b', marginBottom: 5 }}>
                    Maximum Level Reached!
                </h3>
                <p style={{ color: '#666', fontSize: '0.9em' }}>
                    You are a legendary donor. Thank you for your service!
                </p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
            }}>
                <div>
                    <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 4 }}>
                        NEXT BADGE
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span style={{ fontSize: '1.5em' }}>
                            {nextMilestone.icon}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1em', color: '#2c3e50' }}>
                            {nextMilestone.title}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '1.8em',
                        fontWeight: 700,
                        color: '#dc3545'
                    }}>
                        {remaining}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#888' }}>
                        more donation{remaining !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: 12,
                background: '#e0e0e0',
                borderRadius: 6,
                overflow: 'hidden',
                marginBottom: 8
            }}>
                <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: 'linear-gradient(90deg, #dc3545, #e74c3c, #c82333)',
                    borderRadius: 6,
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 8px rgba(220, 53, 69, 0.5)'
                }} />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8em',
                color: '#666'
            }}>
                <span>{current} donations</span>
                <span style={{ fontWeight: 600, color: '#dc3545' }}>{percent}%</span>
                <span>{target} donations</span>
            </div>

            {nextMilestone.message && (
                <div style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: '#fce4ec',
                    borderRadius: 8,
                    fontSize: '0.85em',
                    color: '#856404',
                    textAlign: 'center'
                }}>
                    💡 {nextMilestone.message}
                </div>
            )}
        </div>
    );
};

export default BadgeProgress;
