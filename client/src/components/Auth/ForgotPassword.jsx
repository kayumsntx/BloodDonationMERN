import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) setSent(true);
    };

    if (sent) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">📧</div>
                    <h1>Check Your Email</h1>
                    <p className="auth-subtitle">
                        We've sent a password reset link to your email.
                    </p>

                    <div className="info-box">
                        <p>📩 <strong>{email}</strong></p>
                        <p style={{ marginTop: 10, fontSize: '0.85em' }}>
                            Didn't receive it? Check your spam folder or try again.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="auth-secondary-btn"
                        onClick={() => setSent(false)}
                    >
                        🔄 Try Another Email
                    </button>

                    <p className="auth-footer">
                        Remember your password? <Link to="/login">Sign In</Link>
                    </p>
                </div>

                <footer className="auth-footer-credit">
                    <span className="dev-credit-title">Developed By</span>
                    <a
                        href="https://www.facebook.com/asmatechsolutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-credit-name"
                    >
                        ASMA Computer and IT Solutions
                    </a>
                </footer>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔐</div>
                <h1>Forgot Password?</h1>
                <p className="auth-subtitle">
                    Enter your email and we'll send you a reset link
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoFocus
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : '📤 Send Reset Link'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password? <Link to="/login">Sign In</Link>
                </p>
                <p className="auth-footer" style={{ marginTop: 5 }}>
                    New here? <Link to="/register">Create Account</Link>
                </p>
            </div>

            <footer className="auth-footer-credit">
                <span className="dev-credit-title">Developed By</span>
                <a
                    href="https://www.facebook.com/asmatechsolutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-credit-name"
                >
                    ASMA Computer and IT Solutions
                </a>
            </footer>
        </div>
    );
};

export default ForgotPassword;
