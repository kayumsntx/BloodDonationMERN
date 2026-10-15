import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const { verifyEmail, updateUser, user } = useAuth();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('failed');
                setMessage('No verification token provided');
                return;
            }

            const result = await verifyEmail(token);
            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Email verified successfully!');
                if (user) updateUser({ isEmailVerified: true });
            } else {
                setStatus('failed');
                setMessage(result.error || 'Verification failed');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                {status === 'verifying' && (
                    <>
                        <div className="auth-logo">⏳</div>
                        <h1>Verifying Email...</h1>
                        <p className="auth-subtitle">Please wait a moment</p>
                        <div className="spinner" />
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="auth-logo">✅</div>
                        <h1>Email Verified!</h1>
                        <p className="auth-subtitle">{message}</p>

                        <div className="info-box success">
                            <p>🎉 Your email has been successfully verified! You can now use all features.</p>
                        </div>

                        <Link
                            to="/dashboard"
                            className="auth-secondary-btn"
                            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                        >
                            → Go to Dashboard
                        </Link>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="auth-logo">❌</div>
                        <h1>Verification Failed</h1>
                        <p className="auth-subtitle">{message}</p>

                        <div className="info-box error">
                            <p>⚠️ The token is invalid or has expired. Please register again or request a new verification email.</p>
                        </div>

                        <Link
                            to="/login"
                            className="auth-secondary-btn"
                            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                        >
                            → Back to Login
                        </Link>
                    </>
                )}
            </div>

            <footer className="auth-footer-credit">
                <span className="dev-credit-title">Developed By</span>
                <span className="dev-credit-name">ASMA Computer and IT Solutions</span>
                <span className="dev-credit-info">Savar, Dhaka-1344 • +88 xxxxxxxxxxxxxx</span>
            </footer>
        </div>
    );
};

export default VerifyEmail;
