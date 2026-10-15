import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailBanner = () => {
    const { user, resendVerification } = useAuth();
    const [sending, setSending] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (!user || user.isEmailVerified || dismissed) return null;

    const handleResend = async () => {
        setSending(true);
        await resendVerification();
        setSending(false);
    };

    return (
        <div style={{
            background: 'linear-gradient(90deg, #fff3cd, #ffe8a1)',
            color: '#856404',
            padding: '12px 20px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            border: '1px solid #ffeeba'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3em' }}>⚠️</span>
                <div>
                    <strong>Email not verified</strong>
                    <div style={{ fontSize: '0.85em' }}>
                        Please verify your email to unlock all features
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={handleResend}
                    disabled={sending}
                    style={{
                        padding: '6px 14px',
                        background: '#856404',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.85em',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        opacity: sending ? 0.6 : 1
                    }}
                >
                    {sending ? 'Sending...' : '📧 Resend'}
                </button>
                <button
                    onClick={() => setDismissed(true)}
                    style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: '#856404',
                        border: '1px solid #856404',
                        borderRadius: 6,
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

export default VerifyEmailBanner;
