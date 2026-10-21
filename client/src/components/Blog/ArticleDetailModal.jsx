import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ArticleDetailModal = ({ postId, onClose, onPostUpdated }) => {
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (!postId) return;
        loadPost();
    }, [postId]);

    const loadPost = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/posts/${postId}`);
            setPost(data);

            // Check if current user already rated
            if (user && data.ratings) {
                const existing = data.ratings.find(
                    r => (r.user?._id || r.user)?.toString() === user._id?.toString()
                );
                if (existing) {
                    setUserRating(existing.rating);
                }
            }
        } catch (error) {
            console.error('Failed to load article:', error);
            toast.error('Failed to load article details');
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (stars) => {
        if (!user) {
            toast.error('Please login to rate this article');
            return;
        }

        setSubmittingRating(true);
        try {
            const { data } = await api.post(`/posts/${postId}/rate`, { rating: stars });
            setUserRating(stars);
            setPost(prev => ({
                ...prev,
                averageRating: data.averageRating,
                ratingCount: data.ratingCount
            }));
            toast.success(`You rated this article ${stars} stars! ⭐`);
            onPostUpdated?.();
        } catch (error) {
            console.error('Rating failed:', error);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        if (!user) {
            toast.error('Please login to leave a comment');
            return;
        }

        setSubmittingComment(true);
        try {
            const { data } = await api.post(`/posts/${postId}/comment`, { text: commentText.trim() });
            setPost(prev => ({
                ...prev,
                comments: [...(prev.comments || []), data.comment]
            }));
            setCommentText('');
            toast.success('Comment posted! 💬');
            onPostUpdated?.();
        } catch (error) {
            console.error('Comment failed:', error);
            toast.error(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (!postId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
                        Loading article...
                    </div>
                ) : !post ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                        Article not found
                    </div>
                ) : (
                    <div>
                        {/* Category & Credibility Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                            <span className="category-tag">{post.category}</span>
                            {post.isDoctorPost && (
                                <span className="credibility-tag">
                                    <span>🩺</span>
                                    <span>{post.credibilityBadge || 'Verified Medical Advice'}</span>
                                </span>
                            )}
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                👁️ {post.views} views • {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: '1.65rem', color: '#0f172a', margin: '0 0 16px', lineHeight: 1.35, fontWeight: 800 }}>
                            {post.title}
                        </h1>

                        {/* Author Card */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            marginBottom: 20
                        }}>
                            <img
                                src={post.author?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=dc3545&color=fff`}
                                alt={post.author?.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                    {post.author?.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                        {post.authorRole === 'doctor' ? '🩺 Medical Doctor' : post.authorRole}
                                    </span>
                                    {post.author?.bloodGroup && (
                                        <span>• 🩸 {post.author.bloodGroup}</span>
                                    )}
                                    {post.author?.district && (
                                        <span>• 📍 {post.author.district}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cover Image */}
                        {post.coverImage && (
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    maxHeight: 320,
                                    objectFit: 'cover',
                                    borderRadius: 12,
                                    marginBottom: 20
                                }}
                            />
                        )}

                        {/* Doctor Verified Notice Banner */}
                        {post.isDoctorPost && (
                            <div style={{
                                background: '#f0f9ff',
                                borderLeft: '4px solid #0284c7',
                                padding: '12px 16px',
                                borderRadius: '0 10px 10px 0',
                                marginBottom: 20,
                                fontSize: '0.88rem',
                                color: '#0369a1'
                            }}>
                                🩺 <strong>Medical Professional Content:</strong> This article is written by a verified healthcare professional to share safe, peer-informed clinical or blood donor health guidance.
                            </div>
                        )}

                        {/* Full Article Content */}
                        <div style={{
                            fontSize: '1rem',
                            lineHeight: 1.75,
                            color: '#334155',
                            whiteSpace: 'pre-line',
                            marginBottom: 24,
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: 24
                        }}>
                            {post.content}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                                {post.tags.map((tag, idx) => (
                                    <span key={idx} style={{
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        fontSize: '0.78rem',
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        fontWeight: 600
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Interactive 5-Star Rating Widget */}
                        <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fef3c7',
                            borderRadius: 14,
                            padding: '20px',
                            marginBottom: 30,
                            textAlign: 'center'
                        }}>
                            <h4 style={{ margin: '0 0 6px', color: '#92400e', fontSize: '1.05rem', fontWeight: 700 }}>
                                Rate this Article
                            </h4>
                            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#b45309' }}>
                                Average: <strong>{post.averageRating || 0} / 5</strong> ({post.ratingCount || 0} reviews)
                            </p>

                            <div className="stars-container" style={{ justifyContent: 'center', marginBottom: 8 }}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isFilled = star <= (hoverRating || userRating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`star-btn ${isFilled ? 'filled' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => handleRate(star)}
                                            disabled={submittingRating}
                                            title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                                            style={{ fontSize: '2rem' }}
                                        >
                                            ★
                                        </button>
                                    );
                                })}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#92400e' }}>
                                {userRating > 0 ? `Your rating: ${userRating} ★ (Click any star to update)` : 'Click a star to submit your rating'}
                            </span>
                        </div>

                        {/* Comments Section */}
                        <div style={{ marginTop: 24 }}>
                            <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: 16 }}>
                                Comments ({(post.comments || []).length})
                            </h3>

                            {/* Comment Form */}
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Add a comment or share your thoughts..."
                                        className="form-control"
                                        style={{ flex: 1, borderRadius: 24 }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !commentText.trim()}
                                        style={{
                                            background: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 24,
                                            padding: '0 22px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {submittingComment ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </form>

                            {/* Comment List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {(post.comments || []).length === 0 ? (
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        No comments yet. Be the first to start the discussion!
                                    </div>
                                ) : (
                                    post.comments.slice().reverse().map((c, idx) => (
                                        <div key={c._id || idx} style={{
                                            display: 'flex',
                                            gap: 12,
                                            background: '#f8fafc',
                                            padding: '12px 16px',
                                            borderRadius: 12,
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <img
                                                src={c.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=dc3545&color=fff&size=40`}
                                                alt={c.name}
                                                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                                                        {c.name}
                                                    </span>
                                                    {c.role && c.role !== 'user' && (
                                                        <span style={{
                                                            fontSize: '0.68rem',
                                                            background: c.role === 'doctor' ? '#e0f2fe' : '#fef2f2',
                                                            color: c.role === 'doctor' ? '#0284c7' : '#dc2626',
                                                            padding: '2px 6px',
                                                            borderRadius: 6,
                                                            fontWeight: 600,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {c.role === 'doctor' ? '🩺 Doctor' : c.role}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.4 }}>
                                                    {c.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleDetailModal;
