import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const ReportIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: 'technical_issue',
        subject: '',
        description: '',
        name: user?.name || '',
        email: user?.email || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        { value: 'technical_issue', label: '🛠️ Technical Issue / Bug', desc: 'Broken links, UI bugs, chat errors, or crash reports' },
        { value: 'fake_profile', label: '👤 Fake Profile / Suspicious Activity', desc: 'Impersonation, incorrect donor blood group, or fraudulent posts' },
        { value: 'spam', label: '🚫 Spam or Harassment', desc: 'Commercial advertising, repeated unwanted messages, abusive content' },
        { value: 'feedback', label: '💡 Suggestions & Platform Feedback', desc: 'Ideas to improve the Blood Donation platform' },
        { value: 'other', label: '📝 Other Questions & Inquiries', desc: 'General queries for site administrators' }
    ];

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.description.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please provide both a subject and a detailed description.'
            });
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post('/reports/general', {
                subject: formData.subject.trim(),
                category: formData.category,
                description: formData.description.trim(),
                name: formData.name.trim() || undefined,
                email: formData.email.trim() || undefined
            });

            await Swal.fire({
                icon: 'success',
                title: 'Report Submitted! ✅',
                text: res.data.message || 'Thank you! The administration and moderation team has received your report.',
                confirmButtonColor: '#dc2626'
            });

            setFormData({
                category: 'technical_issue',
                subject: '',
                description: '',
                name: user?.name || '',
                email: user?.email || ''
            });

            if (user) {
                navigate('/dashboard');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || error.message
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            maxWidth: 760,
            margin: '30px auto',
            padding: '0 20px 50px'
        }}>
            {/* Header / Intro Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                padding: '36px 32px',
                borderRadius: '20px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginBottom: 12
                    }}>
                        🛡️ Support & Safety Center
                    </div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 800 }}>
                        Report an Issue or Contact Admin
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 600 }}>
                        Your feedback keeps our life-saving community safe and reliable. Submit technical glitches, report suspicious behavior, or share suggestions directly with platform administrators.
                    </p>
                </div>
            </div>

            {/* Submission Form Card */}
            <div style={{
                background: 'white',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                padding: '32px'
            }}>
                <form onSubmit={handleSubmit}>
                    {/* User Info (Auto-populated or input) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 16,
                        marginBottom: 20
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    borderRadius: 10,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Issue Category <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 10,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                background: 'white',
                                outline: 'none',
                                boxSizing: 'border-box',
                                cursor: 'pointer'
                            }}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>
                            {categories.find(c => c.value === formData.category)?.desc}
                        </div>
                    </div>

                    {/* Subject */}
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Subject / Summary <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="e.g., Unable to submit blood request in Savar district"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 10,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Detailed Description */}
                    <div style={{ marginBottom: 26 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Detailed Description <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            required
                            placeholder="Please provide as much context as possible. What happened, what were you trying to do, and what error or behavior occurred?"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 10,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                lineHeight: 1.5
                            }}
                        />
                    </div>

                    {/* Info Notice */}
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '14px 18px',
                        marginBottom: 26,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>🔒</span>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                            All reports are handled confidentially by designated moderators and administrators. We investigate every submission promptly.
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                        <Link
                            to="/dashboard"
                            style={{
                                color: '#64748b',
                                textDecoration: 'none',
                                fontSize: '0.88rem',
                                fontWeight: 600
                            }}
                        >
                            ← Back to Dashboard
                        </Link>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: submitting ? '#94a3b8' : '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '13px 28px',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'background 0.2s',
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                            }}
                        >
                            {submitting ? 'Submitting Report...' : '📨 Submit Report to Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
