import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);
        if (result.success) navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🩸</div>
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue saving lives</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                style={{ paddingRight: 45 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.1em',
                                    color: '#888'
                                }}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 12 }}>
                        <Link
                            to="/forgot-password"
                            style={{ fontSize: '0.85em', color: '#dc3545', fontWeight: 500 }}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
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

export default Login;
