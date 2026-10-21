import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ArticleDetailModal from './ArticleDetailModal';

const ROLES = ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'];

const ApprovalDashboard = () => {
    const { user, isSuperAdmin, isStaff } = useAuth();
    const [pendingPosts, setPendingPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'roles'
    const [previewPostId, setPreviewPostId] = useState(null);

    // Super Admin Role Management State
    const [userSearch, setUserSearch] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (activeTab === 'pending') {
            loadPendingPosts();
        } else if (activeTab === 'all') {
            loadAllPosts();
        }
    }, [activeTab]);

    const loadPendingPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/posts/dashboard/pending');
            setPendingPosts(data || []);
        } catch (error) {
            console.error('Failed to load pending posts:', error);
            toast.error(error.response?.data?.message || 'Access denied or failed to load');
        } finally {
            setLoading(false);
        }
    };

    const loadAllPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/posts/dashboard/all');
            setAllPosts(data || []);
        } catch (error) {
            console.error('Failed to load all posts:', error);
            toast.error(error.response?.data?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (postId) => {
        try {
            const { data } = await api.put(`/posts/dashboard/approve/${postId}`);
            toast.success(data.message || 'Article published successfully! ✅');
            setPendingPosts(prev => prev.filter(p => p._id !== postId));
            if (activeTab === 'all') loadAllPosts();
        } catch (error) {
            console.error('Approval failed:', error);
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (postId) => {
        const reason = window.prompt('Enter reason for rejecting this article:', 'Does not meet content guidelines');
        if (reason === null) return; // User cancelled prompt

        try {
            const { data } = await api.put(`/posts/dashboard/reject/${postId}`, { reason });
            toast.success(data.message || 'Article rejected');
            setPendingPosts(prev => prev.filter(p => p._id !== postId));
            if (activeTab === 'all') loadAllPosts();
        } catch (error) {
            console.error('Rejection failed:', error);
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to permanently delete this article?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            toast.success('Article deleted');
            setPendingPosts(prev => prev.filter(p => p._id !== postId));
            setAllPosts(prev => prev.filter(p => p._id !== postId));
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete article');
        }
    };

    // Super Admin: Search users to change roles
    const handleSearchUsers = async (e) => {
        e?.preventDefault();
        if (!userSearch.trim()) return;
        setSearchingUsers(true);
        try {
            const { data } = await api.get(`/users/donors/search?district=${encodeURIComponent(userSearch.trim())}`);
            setSearchedUsers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleUpdateUserRole = async (targetUserId, newRole) => {
        try {
            const { data } = await api.put(`/posts/admin/user-role/${targetUserId}`, { role: newRole });
            toast.success(data.message);
            setSearchedUsers(prev => prev.map(u => u._id === targetUserId ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        }
    };

    if (!isStaff) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 60,
                background: 'white',
                borderRadius: 16,
                border: '1px solid #fee2e2'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
                <h3 style={{ color: '#dc2626', margin: '0 0 8px' }}>Restricted Access</h3>
                <p style={{ color: '#64748b', margin: 0 }}>
                    Only Super Admins, Admins, and Moderators are authorized to view the Approval Dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="approval-dashboard">
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
            }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '1.45rem', color: '#1e293b', fontWeight: 800 }}>
                        🛡️ Moderator & Approval Dashboard
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                        Review submitted articles, verify doctor credentials, and maintain content standards.
                    </p>
                </div>
                <div style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    background: '#fef2f2',
                    border: '1px solid #fecdd3',
                    color: '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                }}>
                    Your Role: <span style={{ textTransform: 'uppercase' }}>{user?.role}</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="approval-tabs">
                <button
                    type="button"
                    className={`approval-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    ⏳ Pending Review ({pendingPosts.length})
                </button>
                <button
                    type="button"
                    className={`approval-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    📚 All Articles
                </button>
                {isSuperAdmin && (
                    <button
                        type="button"
                        className={`approval-tab ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        👑 Role Management (Super Admin)
                    </button>
                )}
            </div>

            {/* Pending Articles Tab */}
            {activeTab === 'pending' && (
                <div>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                            Loading pending submissions...
                        </div>
                    ) : pendingPosts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'white',
                            borderRadius: 16,
                            border: '1px solid #e2e8f0',
                            color: '#64748b'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✨</div>
                            <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>Queue Clean!</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                There are no pending articles requiring review at this time.
                            </p>
                        </div>
                    ) : (
                        pendingPosts.map(post => (
                            <div key={post._id} className="approval-item-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                            <span className="category-tag">{post.category}</span>
                                            {post.isDoctorPost && (
                                                <span className="credibility-tag">
                                                    <span>🩺</span>
                                                    <span>{post.credibilityBadge || 'Doctor Verified'}</span>
                                                </span>
                                            )}
                                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                                Submitted on {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1e293b' }}>
                                            {post.title}
                                        </h3>
                                    </div>
                                    <div style={{
                                        padding: '4px 10px',
                                        background: '#fef3c7',
                                        color: '#b45309',
                                        borderRadius: 8,
                                        fontWeight: 700,
                                        fontSize: '0.75rem'
                                    }}>
                                        STATUS: PENDING
                                    </div>
                                </div>

                                {/* Author info */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 12px',
                                    background: '#f8fafc',
                                    borderRadius: 10,
                                    fontSize: '0.85rem'
                                }}>
                                    <span>👤 Author: <strong>{post.author?.name}</strong></span>
                                    <span>•</span>
                                    <span>Role: <strong style={{ textTransform: 'capitalize' }}>{post.authorRole}</strong></span>
                                    {post.author?.bloodGroup && <span>• 🩸 {post.author.bloodGroup}</span>}
                                    {post.author?.district && <span>• 📍 {post.author.district}</span>}
                                </div>

                                {/* Content snippet */}
                                <div style={{
                                    fontSize: '0.92rem',
                                    color: '#475569',
                                    lineHeight: 1.5,
                                    background: '#fafafa',
                                    padding: '14px',
                                    borderRadius: 10,
                                    whiteSpace: 'pre-line'
                                }}>
                                    {post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content}
                                </div>

                                {/* Actions */}
                                <div className="approval-actions">
                                    <button
                                        type="button"
                                        className="btn-approve"
                                        onClick={() => handleApprove(post._id)}
                                    >
                                        ✅ Approve & Publish
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-reject"
                                        onClick={() => handleReject(post._id)}
                                    >
                                        ❌ Reject
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            background: '#f1f5f9',
                                            border: 'none',
                                            padding: '10px 18px',
                                            borderRadius: 10,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            color: '#334155'
                                        }}
                                        onClick={() => setPreviewPostId(post._id)}
                                    >
                                        👁️ Full Preview
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            type="button"
                                            style={{
                                                background: '#fef2f2',
                                                border: '1px solid #fecdd3',
                                                color: '#dc2626',
                                                padding: '10px 14px',
                                                borderRadius: 10,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                marginLeft: 'auto'
                                            }}
                                            onClick={() => handleDelete(post._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* All Articles Tab */}
            {activeTab === 'all' && (
                <div>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                            Loading all articles...
                        </div>
                    ) : allPosts.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                            No articles found
                        </div>
                    ) : (
                        allPosts.map(post => (
                            <div key={post._id} className="approval-item-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                                        {post.title}
                                    </h4>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        background: post.status === 'published' ? '#dcfce7' : (post.status === 'rejected' ? '#fee2e2' : '#fef3c7'),
                                        color: post.status === 'published' ? '#166534' : (post.status === 'rejected' ? '#991b1b' : '#b45309')
                                    }}>
                                        {post.status.toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    By {post.author?.name} ({post.authorRole}) • Category: {post.category} • Views: {post.views} • Rating: ⭐ {post.averageRating}
                                </div>

                                <div className="approval-actions">
                                    {post.status !== 'published' && (
                                        <button
                                            type="button"
                                            className="btn-approve"
                                            onClick={() => handleApprove(post._id)}
                                        >
                                            Publish
                                        </button>
                                    )}
                                    {post.status !== 'rejected' && (
                                        <button
                                            type="button"
                                            className="btn-reject"
                                            onClick={() => handleReject(post._id)}
                                        >
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        style={{
                                            background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer'
                                        }}
                                        onClick={() => setPreviewPostId(post._id)}
                                    >
                                        View Details
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            type="button"
                                            style={{
                                                background: '#fef2f2', border: 'none', color: '#dc2626', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto'
                                            }}
                                            onClick={() => handleDelete(post._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Super Admin Role Management Tab */}
            {activeTab === 'roles' && isSuperAdmin && (
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>
                        👑 RBAC Role Assignment & User Privileges
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
                        As Super Admin, you have full control over user roles. Search for donors or members to promote them to Doctors, Moderators, or Admins.
                    </p>

                    <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                        <input
                            type="text"
                            placeholder="Enter district or name to find users..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            className="form-control"
                            style={{ flex: 1 }}
                        />
                        <button
                            type="submit"
                            disabled={searchingUsers}
                            style={{
                                background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: '0 24px', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            {searchingUsers ? 'Searching...' : 'Search Users'}
                        </button>
                    </form>

                    <div>
                        {searchedUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>
                                Enter a district (e.g. Dhaka, Chittagong) or search term to manage users
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {searchedUsers.map(u => (
                                    <div key={u._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 18px',
                                        background: '#f8fafc',
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0',
                                        flexWrap: 'wrap',
                                        gap: 12
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                🩸 {u.bloodGroup} • {u.district} • Current Role: <span style={{ fontWeight: 700, color: '#dc2626' }}>{u.role || 'user'}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Assign Role:</label>
                                            <select
                                                value={u.role || 'user'}
                                                onChange={e => handleUpdateUserRole(u._id, e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '0.88rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewPostId && (
                <ArticleDetailModal
                    postId={previewPostId}
                    onClose={() => setPreviewPostId(null)}
                />
            )}
        </div>
    );
};

export default ApprovalDashboard;
