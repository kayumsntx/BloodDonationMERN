import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
    'Blood Donation',
    'Health & Medical',
    'Stories & Experiences',
    'Donor Guidelines',
    'Nutrition & Lifestyle',
    'General'
];

const CreateArticleModal = ({ onClose, onSuccess }) => {
    const { user, isDoctor } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        category: isDoctor ? 'Health & Medical' : 'Blood Donation',
        excerpt: '',
        content: '',
        tags: '',
        coverImage: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Title and content are required');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await api.post('/posts', {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            toast.success(data.message || 'Article submitted successfully!');
            onSuccess?.(data.post);
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit article');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: '2rem' }}>✍️</span>
                    <h3 style={{ margin: '8px 0 4px', fontSize: '1.4rem', color: '#1e293b' }}>
                        Write an Article
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                        Share knowledge, donor experiences, or medical guidance with our community.
                    </p>
                </div>

                {isDoctor ? (
                    <div style={{
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        borderRadius: 12,
                        padding: '12px 16px',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: '#0369a1',
                        fontSize: '0.88rem',
                        fontWeight: 600
                    }}>
                        <span style={{ fontSize: '1.4rem' }}>🩺</span>
                        <div>
                            <strong>Doctor Publication:</strong> Your post will be marked with a <strong>Verified Medical Advice</strong> credibility badge.
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: 12,
                        padding: '12px 16px',
                        marginBottom: 20,
                        color: '#92400e',
                        fontSize: '0.85rem'
                    }}>
                        ℹ️ <strong>Review Notice:</strong> To ensure high-quality, safe content, submitted articles are reviewed by moderators before publication.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Article Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Why Regular Blood Donation Improves Cardiovascular Health"
                            className="form-control"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-control"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Cover Image URL (optional)</label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Short Excerpt / Summary</label>
                        <input
                            type="text"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            placeholder="A brief 1-2 sentence preview of the article..."
                            className="form-control"
                            maxLength={250}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="blood-health, platelets, hemoglobin, eligibility"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Article Content *</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your article here. Share facts, medical advice, donor tips, or heartfelt stories..."
                            className="form-control"
                            style={{ minHeight: 180 }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '12px', background: '#f1f5f9',
                                border: 'none', borderRadius: 10, fontWeight: 600, color: '#475569', cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 2, padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                border: 'none', borderRadius: 10, fontWeight: 700, color: 'white', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            {submitting ? 'Submitting Article...' : '🚀 Submit Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateArticleModal;
