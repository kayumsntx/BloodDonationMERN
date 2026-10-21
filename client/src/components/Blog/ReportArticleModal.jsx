import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
    'Inaccurate or harmful medical advice',
    'Spam, advertising, or promotional link',
    'Harassment, abusive language, or hate speech',
    'Fake donor/patient story or fraudulent request',
    'Copyright or intellectual property violation',
    'Other policy violation'
];

const ReportArticleModal = ({ post, onClose, onReportSubmitted }) => {
    const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!post) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalReason = selectedReason === 'Other policy violation' && customReason.trim()
            ? `Other: ${customReason.trim()}`
            : (customReason.trim() ? `${selectedReason} - ${customReason.trim()}` : selectedReason);

        setSubmitting(true);
        try {
            const { data } = await api.post('/reports', {
                postId: post._id,
                reason: finalReason
            });
            toast.success(data.message || 'Report submitted to moderators! 🚩');
            onReportSubmitted?.();
            onClose();
        } catch (error) {
            console.error('Report error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: '1.8rem' }}>🚩</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>
                            Report Article to Admin
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                            Help us keep community medical articles safe, accurate, and respectful.
                        </p>
                    </div>
                </div>

                <div style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #dc2626',
                    marginBottom: 18,
                    fontSize: '0.88rem',
                    color: '#334155',
                    fontWeight: 600
                }}>
                    Reporting: "{post.title}"
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Reason for reporting *</label>
                        <select
                            value={selectedReason}
                            onChange={e => setSelectedReason(e.target.value)}
                            className="form-control"
                        >
                            {REPORT_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional details or context (optional)</label>
                        <textarea
                            value={customReason}
                            onChange={e => setCustomReason(e.target.value)}
                            placeholder="Provide any additional explanation or link to assist our moderation team..."
                            className="form-control"
                            style={{ minHeight: 90 }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '10px', background: '#f1f5f9',
                                border: 'none', borderRadius: 10, fontWeight: 600, color: '#475569', cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 2, padding: '10px', background: '#dc2626',
                                border: 'none', borderRadius: 10, fontWeight: 700, color: 'white', cursor: 'pointer'
                            }}
                        >
                            {submitting ? 'Submitting Report...' : '🚩 Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportArticleModal;
