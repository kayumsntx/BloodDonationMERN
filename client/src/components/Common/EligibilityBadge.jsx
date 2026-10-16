import React from 'react';

const EligibilityBadge = ({ eligibility, size = 'normal' }) => {
    if (!eligibility) return null;

    const { eligible, daysRemaining } = eligibility;

    const sizes = {
        small: { fontSize: '0.7em', padding: '2px 8px' },
        normal: { fontSize: '0.8em', padding: '4px 10px' },
        large: { fontSize: '0.9em', padding: '6px 14px' }
    };

    const size_ = sizes[size] || sizes.normal;

    if (eligible) {
        return (
            <span style={{
                display: 'inline-block',
                background: '#d4edda',
                color: '#155724',
                borderRadius: 12,
                fontWeight: 600,
                ...size_
            }}>
                ✅ Eligible
            </span>
        );
    }

    return (
        <span style={{
            display: 'inline-block',
            background: '#fff3cd',
            color: '#856404',
            borderRadius: 12,
            fontWeight: 600,
            ...size_
        }}>
            ⏳ {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
        </span>
    );
};

export default EligibilityBadge;
