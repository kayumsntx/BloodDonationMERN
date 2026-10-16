import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DonationReminder = () => {
    const [eligibility, setEligibility] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check localStorage for dismissed state
        const wasDismissed = localStorage.getItem('donationReminderDismissed');
        if (wasDismissed) {
            const dismissedAt = new Date(wasDismissed);
            const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
            // Show again after 1 day
            if (daysSince < 1) {
                setDismissed(true);
            }
        }

        loadEligibility();
    }, []);

    const loadEligibility = async () => {
        try {
            const { data } = await api.get('/users/eligibility');
            setEligibility(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('donationReminderDismissed', new Date().toISOString());
    };

    if (dismissed || !eligibility || !eligibility.eligible) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            border: '2px solid #28a745',
            borderRadius: 12,
            padding: '15px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '2em' }}>🩸</span>
                <div>
                    <div style={{
                        fontWeight: 700,
                        color: '#155724',
                        fontSize: '1em'
                    }}>
                        You're eligible to donate again!
                    </div>
                    <div style={{
                        fontSize: '0.85em',
                        color: '#155724',
                        opacity: 0.85,
                        marginTop: 3
                    }}>
                        Your 90-day recovery period is complete. Save a life today.
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={() => navigate('/dashboard/feed')}
                    style={{
                        padding: '8px 16px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85em',
                        cursor: 'pointer'
                    }}
                >
                    Find Requests →
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        color: '#155724',
                        border: '1px solid #155724',
                        borderRadius: 8,
                        fontSize: '0.85em',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default DonationReminder;
