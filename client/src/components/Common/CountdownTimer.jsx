import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, compact = false, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft(targetDate);
            setTimeLeft(remaining);

            if (remaining.total <= 0 && !completed) {
                setCompleted(true);
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, completed, onComplete]);

    if (!targetDate) return null;

    if (timeLeft.total <= 0) {
        return (
            <div style={{
                color: '#28a745',
                fontWeight: 700,
                fontSize: compact ? '0.9em' : '1.2em'
            }}>
                🎉 You can donate now!
            </div>
        );
    }

    if (compact) {
        return (
            <span style={{ color: '#856404', fontWeight: 600, fontSize: '0.85em' }}>
                ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
        );
    }

    return (
        <div style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap'
        }}>
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div style={{
        background: 'white',
        borderRadius: 10,
        padding: '12px 16px',
        minWidth: 70,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
        <div style={{
            fontSize: '1.8em',
            fontWeight: 700,
            color: '#dc3545',
            lineHeight: 1
        }}>
            {String(value).padStart(2, '0')}
        </div>
        <div style={{
            fontSize: '0.7em',
            color: '#888',
            textTransform: 'uppercase',
            marginTop: 5,
            fontWeight: 600
        }}>
            {label}
        </div>
    </div>
);

function calculateTimeLeft(targetDate) {
    if (!targetDate) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const difference = new Date(targetDate) - new Date();

    if (difference <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        total: difference,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
    };
}

export default CountdownTimer;
