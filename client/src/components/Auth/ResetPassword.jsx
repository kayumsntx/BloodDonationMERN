import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    const getPasswordStrength = (pass) => {
        if (!pass) return { label: '', color: '', width: '0%' };
        let score = 0;
        if (pass.length >= 6) score++;
        if (pass.length >= 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { label: 'Weak', color: '#e74c3c', width: '25%' };
        if (score <= 2) return { label: 'Fair', color: '#f39c12', width: '50%' };
        if (score <= 3) return { label: 'Good', color: '#3498db', width: '75%' };
        return { label: 'Strong', color: '#28a745', width: '100%' };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Reset failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔑</div>
                <h1>Reset Password</h1>
                <p className="auth-subtitle">Enter your new password</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                            autoFocus
                        />
                        {password && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{
                                    height: 4,
                                    background: '#e0e0e0',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: strength.width,
                                        background: strength.color,
                                        transition: 'all 0.3s'
                                    }} />
                                </div>
                                <div style={{
                                    fontSize: '0.75em',
                                    color: strength.color,
                                    marginTop: 4,
                                    fontWeight: 600
                                }}>
                                    {strength.label}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <div style={{ color: '#e74c3c', fontSize: '0.8em', marginTop: 4 }}>
                                ⚠️ Passwords do not match
                            </div>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <div style={{ color: '#28a745', fontSize: '0.8em', marginTop: 4 }}>
                                ✅ Passwords match
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            background: '#f8d7da',
                            color: '#721c24',
                            padding: '10px 15px',
                            borderRadius: 8,
                            fontSize: '0.85em',
                            marginBottom: 15
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : '🔒 Reset Password'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember it? <Link to="/login">Sign In</Link>
                </p>
            </div>

            <footer className="auth-footer-credit">
                <span className="dev-credit-title">Developed By</span>
                <span className="dev-credit-name">ASMA Computer and IT Solutions</span>
                <span className="dev-credit-info">Savar, Dhaka-1344 • +88 xxxxxxxxxxxxxx</span>
            </footer>
        </div>
    );
};

export default ResetPassword;
