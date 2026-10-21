import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ArticleDetailModal from '../Blog/ArticleDetailModal';

const ReportedArticles = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [previewPostId, setPreviewPostId] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadReports();
    }, [statusFilter]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const query = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
            const { data } = await api.get(`/admin/reports${query}`);
            setReports(data || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
            toast.error(error.response?.data?.message || 'Failed to load article reports');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (reportId) => {
        setProcessingId(reportId);
        try {
            const { data } = await api.put(`/admin/reports/${reportId}/resolve`);
            toast.success(data.message || 'Report marked as reviewed! ✅');
            setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'reviewed' } : r));
        } catch (error) {
            console.error('Resolve error:', error);
            toast.error(error.response?.data?.message || 'Failed to resolve report');
        } finally {
            setProcessingId(null);
        }
    };

    const handleTakeDownPost = async (postId, reportId) => {
        if (!window.confirm('Are you sure you want to take down and permanently delete this reported article?')) return;

        setProcessingId(reportId);
        try {
            await api.delete(`/admin/posts/${postId}`);
            toast.success('Article taken down and deleted! 🗑️');
            // Also mark report as resolved
            await api.put(`/admin/reports/${reportId}/resolve`).catch(() => {});
            loadReports();
        } catch (error) {
            console.error('Take down error:', error);
            toast.error(error.response?.data?.message || 'Failed to take down article');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <div>
                    <h3>🚩 Reported Articles</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Review community flags, policy violations, and inaccurate medical content.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Reports</option>
                        <option value="pending">Pending Review</option>
                        <option value="reviewed">Resolved / Reviewed</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
                        Loading reported articles...
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🛡️</div>
                        <h4 style={{ margin: '0 0 4px', color: '#1e293b' }}>No reports found</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            No articles currently have active flags or complaints.
                        </p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Reported Article</th>
                                <th>Report Reason</th>
                                <th>Reported By</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => {
                                const post = report.post;
                                const reporter = report.user || {};
                                const isPending = report.status === 'pending';

                                return (
                                    <tr key={report._id}>
                                        {/* Article info */}
                                        <td style={{ maxWidth: 260 }}>
                                            {post ? (
                                                <div>
                                                    <div
                                                        onClick={() => setPreviewPostId(post._id)}
                                                        style={{ fontWeight: 700, color: '#1e293b', cursor: 'pointer', lineHeight: 1.3 }}
                                                        title="Click to preview article"
                                                    >
                                                        {post.title}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                                                        Category: {post.category || 'General'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                                    [Article Deleted]
                                                </span>
                                            )}
                                        </td>

                                        {/* Reason */}
                                        <td style={{ maxWidth: 280 }}>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#b91c1c',
                                                background: '#fef2f2',
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                lineHeight: 1.35
                                            }}>
                                                {report.reason}
                                            </div>
                                        </td>

                                        {/* Reporter */}
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#334155' }}>
                                                {reporter.name || 'Anonymous'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {reporter.email || '—'}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`badge-status ${report.status}`}>
                                                {isPending ? '● Pending' : '✓ Reviewed'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                {post && (
                                                    <button
                                                        type="button"
                                                        className="btn-action secondary"
                                                        onClick={() => setPreviewPostId(post._id)}
                                                        title="Preview post"
                                                    >
                                                        View Post
                                                    </button>
                                                )}

                                                {isPending && (
                                                    <button
                                                        type="button"
                                                        className="btn-action success"
                                                        onClick={() => handleResolve(report._id)}
                                                        disabled={processingId === report._id}
                                                        title="Dismiss / Mark Reviewed"
                                                    >
                                                        Resolve ✓
                                                    </button>
                                                )}

                                                {post && (
                                                    <button
                                                        type="button"
                                                        className="btn-action danger"
                                                        onClick={() => handleTakeDownPost(post._id, report._id)}
                                                        disabled={processingId === report._id}
                                                        title="Delete and Take Down Post"
                                                    >
                                                        Take Down Post
                                                    </button>
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

            {/* Article Detail Modal */}
            {previewPostId && (
                <ArticleDetailModal
                    postId={previewPostId}
                    onClose={() => setPreviewPostId(null)}
                    onPostUpdated={() => loadReports()}
                />
            )}
        </div>
    );
};

export default ReportedArticles;
