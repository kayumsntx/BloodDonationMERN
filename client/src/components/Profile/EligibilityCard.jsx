import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import CountdownTimer from '../Common/CountdownTimer';
import toast from 'react-hot-toast';

const EligibilityCard = () => {
    const [eligibility, setEligibility] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEligibility();
    }, []);

    const loadEligibility = async () => {
        try {
            const { data } = await api.get('/users/eligibility');
            setEligibility(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCelebrate = () => {
        toast.success('🎉 You are now eligible to donate again!', { duration: 6000 });
    };

    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 25,
                textAlign: 'center',
                color: '#999',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                Checking eligibility...
            </div>
        );
    }

    if (!eligibility) return null;

    const { eligible, reason, nextEligibleDate, daysRemaining, lastDonation } = eligibility;

    // Eligible state
    if (eligible) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: 15,
                padding: '25px 20px',
                marginBottom: 20,
                border: '2px solid #28a745',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3em', marginBottom: 8 }}>🩸</div>
                <h3 style={{
                    color: '#155724',
                    fontSize: '1.3em',
                    marginBottom: 5
                }}>
                    You're Eligible to Donate!
                </h3>
                <p style={{
                    color: '#155724',
                    fontSize: '0.9em',
                    marginBottom: 15,
                    opacity: 0.85
                }}>
                    Your body has fully recovered. You can save a life today!
                </p>

                {lastDonation && (
                    <div style={{
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 8,
                        padding: '10px 15px',
                        display: 'inline-block',
                        fontSize: '0.85em',
                        color: '#155724'
                    }}>
                        Last donation: <strong>
                            {new Date(lastDonation.date).toLocaleDateString()}
                        </strong> at <strong>{lastDonation.hospital}</strong>
                    </div>
                )}
            </div>
        );
    }

    // Not eligible state
    return (
        <div style={{
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
            borderRadius: 15,
            padding: '25px 20px',
            marginBottom: 20,
            border: '2px solid #ffc107'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 15 }}>
                <div style={{ fontSize: '2.5em', marginBottom: 8 }}>⏳</div>
                <h3 style={{
                    color: '#856404',
                    fontSize: '1.2em',
                    marginBottom: 5
                }}>
                    Not Eligible Yet
                </h3>
                <p style={{
                    color: '#856404',
                    fontSize: '0.85em',
                    opacity: 0.9
                }}>
                    {reason}
                </p>
            </div>

            {/* Countdown Timer */}
            {nextEligibleDate && (
                <>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.85em',
                        color: '#856404',
                        marginBottom: 12,
                        fontWeight: 600
                    }}>
                        Next donation available on{' '}
                        {new Date(nextEligibleDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>

                    <CountdownTimer
                        targetDate={nextEligibleDate}
                        onComplete={handleCelebrate}
                    />

                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.75em',
                        color: '#856404',
                        marginTop: 12,
                        opacity: 0.8
                    }}>
                        💡 Tip: Eat iron-rich foods to prepare for your next donation
                    </div>
                </>
            )}

            {lastDonation && (
                <div style={{
                    marginTop: 15,
                    padding: '10px 15px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: 8,
                    fontSize: '0.85em',
                    color: '#856404',
                    textAlign: 'center'
                }}>
                    Last donated: <strong>
                        {new Date(lastDonation.date).toLocaleDateString()}
                    </strong> at {lastDonation.hospital}
                </div>
            )}
        </div>
    );
};

export default EligibilityCard;
