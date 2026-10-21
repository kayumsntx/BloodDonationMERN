import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ArticleDetailModal from '../Blog/ArticleDetailModal';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, published: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [subTab, setSubTab] = useState('pending'); // 'pending' | 'published' | 'rejected'
    const [previewPostId, setPreviewPostId] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadPosts();
    }, [subTab]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/admin/posts?status=${subTab}`);
            setPosts(data.posts || []);
            if (data.counts) {
                setCounts(data.counts);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
            toast.error(error.response?.data?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (postId) => {
        setProcessingId(postId);
        try {
            const { data } = await api.put(`/admin/posts/${postId}/approve`);
            toast.success(data.message || 'Article published successfully! ✅');
            loadPosts();
        } catch (error) {
            console.error('Approve failed:', error);
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (postId) => {
        const reason = window.prompt('Enter reason for rejecting this article:', 'Does not meet our content guidelines');
        if (reason === null) return;

        setProcessingId(postId);
        try {
            const { data } = await api.put(`/admin/posts/${postId}/reject`, { reason });
            toast.success(data.message || 'Article rejected');
            loadPosts();
        } catch (error) {
            console.error('Reject failed:', error);
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to permanently take down and delete this article?')) return;

        setProcessingId(postId);
        try {
            const { data } = await api.delete(`/admin/posts/${postId}`);
            toast.success(data.message || 'Article permanently deleted! 🗑️');
            loadPosts();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="admin-card">
            {/* Header & Sub-Tabs */}
            <div className="admin-card-header">
                <div>
                    <h3>📝 Post / Article Management</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Review, moderate, approve, and manage community submissions.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        type="button"
                        className={`admin-nav-tab ${subTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setSubTab('pending')}
                    >
                        <span>⏳ Pending Posts</span>
                        <span className="admin-tab-badge red">{counts.pending}</span>
                    </button>
                    <button
                        type="button"
                        className={`admin-nav-tab ${subTab === 'published' ? 'active' : ''}`}
                        onClick={() => setSubTab('published')}
                    >
                        <span>✅ Published Posts</span>
                        <span className="admin-tab-badge gray">{counts.published}</span>
                    </button>
                    <button
                        type="button"
                        className={`admin-nav-tab ${subTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setSubTab('rejected')}
                    >
                        <span>❌ Rejected Posts</span>
                        <span className="admin-tab-badge gray">{counts.rejected}</span>
                    </button>
                </div>
            </div>

            {/* Content Table / Cards */}
            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
                        Loading articles...
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>
                            {subTab === 'pending' ? '✨' : (subTab === 'published' ? '📰' : '📁')}
                        </div>
                        <h4 style={{ margin: '0 0 4px', color: '#1e293b' }}>
                            No {subTab} articles found
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            {subTab === 'pending' ? 'The moderation queue is currently clear.' : `No articles are currently marked as ${subTab}.`}
                        </p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Article Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Date Submitted</th>
                                <th>Status / Badges</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => {
                                const author = post.author || {};
                                const isDoctor = post.isDoctorPost || post.authorRole === 'doctor';

                                return (
                                    <tr key={post._id}>
                                        {/* Title */}
                                        <td style={{ maxWidth: 300 }}>
                                            <div
                                                onClick={() => setPreviewPostId(post._id)}
                                                style={{ fontWeight: 700, color: '#1e293b', cursor: 'pointer', lineHeight: 1.3 }}
                                                title="Click to preview article"
                                            >
                                                {post.title}
                                            </div>
                                            {post.rejectionReason && subTab === 'rejected' && (
                                                <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: 4 }}>
                                                    Reason: {post.rejectionReason}
                                                </div>
                                            )}
                                        </td>

                                        {/* Author */}
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#334155' }}>
                                                {author.name || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                                                {post.authorRole || 'user'}
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td>
                                            <span className="category-tag">
                                                {post.category}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Badges / Credibility */}
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span className={`badge-status ${post.status}`}>
                                                    ● {post.status}
                                                </span>
                                                {isDoctor && (
                                                    <span className="credibility-tag" style={{ width: 'fit-content' }}>
                                                        🩺 Doctor Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="btn-action secondary"
                                                    onClick={() => setPreviewPostId(post._id)}
                                                    title="Full preview"
                                                >
                                                    👁️ Preview
                                                </button>

                                                {subTab === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-action success"
                                                            onClick={() => handleApprove(post._id)}
                                                            disabled={processingId === post._id}
                                                            title="Approve and publish"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action danger"
                                                            onClick={() => handleReject(post._id)}
                                                            disabled={processingId === post._id}
                                                            title="Reject submission"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {subTab === 'published' && (
                                                    <button
                                                        type="button"
                                                        className="btn-action danger"
                                                        onClick={() => handleDelete(post._id)}
                                                        disabled={processingId === post._id}
                                                        title="Delete and take down article"
                                                    >
                                                        Take Down / Delete 🗑️
                                                    </button>
                                                )}

                                                {subTab === 'rejected' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-action success"
                                                            onClick={() => handleApprove(post._id)}
                                                            disabled={processingId === post._id}
                                                            title="Re-approve article"
                                                        >
                                                            Re-approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action danger"
                                                            onClick={() => handleDelete(post._id)}
                                                            disabled={processingId === post._id}
                                                            title="Permanently delete"
                                                        >
                                                            Delete 🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Article Detail Modal for review */}
            {previewPostId && (
                <ArticleDetailModal
                    postId={previewPostId}
                    onClose={() => setPreviewPostId(null)}
                    onPostUpdated={() => loadPosts()}
                />
            )}
        </div>
    );
};

export default PostManagement;
