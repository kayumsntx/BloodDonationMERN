import React from 'react';

const BadgeCard = ({ badge, size = 'normal', showLocked = true }) => {
    if (!badge) return null;

    const isLocked = !badge.unlocked && showLocked;

    const sizes = {
        small: { card: 80, icon: '2em', title: '0.7em', sub: '0.6em' },
        normal: { card: 120, icon: '3em', title: '0.85em', sub: '0.7em' },
        large: { card: 160, icon: '4em', title: '1em', sub: '0.8em' }
    };

    const s = sizes[size] || sizes.normal;

    return (
        <div style={{
            width: s.card,
            padding: 15,
            borderRadius: 12,
            background: isLocked ? '#f8f9fa' : `linear-gradient(135deg, ${badge.color}22, ${badge.color}44)`,
            border: `2px solid ${isLocked ? '#e0e0e0' : badge.color}`,
            textAlign: 'center',
            opacity: isLocked ? 0.6 : 1,
            transition: 'all 0.3s',
            position: 'relative'
        }}>
            {isLocked && (
                <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: '1em',
                    opacity: 0.7
                }}>
                    🔒
                </div>
            )}

            <div style={{
                fontSize: s.icon,
                marginBottom: 8,
                filter: isLocked ? 'grayscale(100%)' : 'none'
            }}>
                {badge.icon}
            </div>

            <div style={{
                fontSize: s.title,
                fontWeight: 700,
                color: isLocked ? '#999' : badge.color,
                marginBottom: 3
            }}>
                {badge.name}
            </div>

            <div style={{
                fontSize: s.sub,
                color: '#888',
                marginTop: 4
            }}>
                {badge.minDonations} donation{badge.minDonations !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default BadgeCard;
