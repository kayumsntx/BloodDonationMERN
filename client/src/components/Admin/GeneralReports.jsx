import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import './Admin.css';

const CATEGORY_LABELS = {
    technical_issue: { label: 'Technical Issue', icon: '🛠️', bg: '#fee2e2', color: '#b91c1c' },
    fake_profile: { label: 'Fake Profile', icon: '👤', bg: '#fef3c7', color: '#b45309' },
    spam: { label: 'Spam / Abuse', icon: '🚫', bg: '#fce7f3', color: '#be185d' },
    feedback: { label: 'Platform Feedback', icon: '💡', bg: '#e0f2fe', color: '#0369a1' },
    other: { label: 'Other Inquiries', icon: '📝', bg: '#f1f5f9', color: '#475569' }
};

const STATUS_CONFIG = {
    pending: { label: 'Pending', colorClass: 'pending', icon: '⏳' },
    in_progress: { label: 'In Progress', colorClass: 'in_progress', icon: '⚙️' },
    resolved: { label: 'Resolved', colorClass: 'resolved', icon: '✅' }
};

const GeneralReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [statusFilter, categoryFilter]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (categoryFilter !== 'all') params.category = categoryFilter;

            const res = await api.get('/admin/reports/general', { params });
            setReports(res.data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to load general reports',
                text: error.response?.data?.message || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        const report = reports.find(r => r._id === reportId);
        if (!report) return;

        let adminNotes = report.adminNotes || '';
        
        // If resolving, ask for optional note
        if (newStatus === 'resolved') {
            const { value: notes, isConfirmed } = await Swal.fire({
                title: 'Mark as Resolved?',
                text: `Add optional resolution notes for this inquiry:`,
                input: 'textarea',
                inputPlaceholder: 'e.g., Issue verified and fixed in production build.',
                inputValue: adminNotes,
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, Resolve It!'
            });

            if (!isConfirmed) return;
            adminNotes = notes || '';
        }

        try {
            setUpdatingId(reportId);
            const res = await api.put(`/admin/reports/general/${reportId}`, {
                status: newStatus,
                adminNotes
            });

            Swal.fire({
                icon: 'success',
                title: 'Report Updated',
                text: res.data.message || `Status set to ${newStatus}`,
                timer: 2000,
                showConfirmButton: false
            });

            setReports(prev => prev.map(r => r._id === reportId ? res.data.report : r));
            if (selectedReport?._id === reportId) {
                setSelectedReport(res.data.report);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || error.message
            });
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter reports by search
    const filteredReports = reports.filter(r => {
        const query = searchQuery.toLowerCase();
        const subject = (r.subject || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const name = (r.name || r.user?.name || '').toLowerCase();
        const email = (r.email || r.user?.email || '').toLowerCase();
        return subject.includes(query) || desc.includes(query) || name.includes(query) || email.includes(query);
    });

    const pendingCount = reports.filter(r => r.status === 'pending').length;
    const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;

    return (
        <div className="admin-general-reports">
            {/* Quick Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        ⏳
                    </div>
                    <div className="admin-stat-info">
                        <h4>{pendingCount}</h4>
                        <p>Pending Issues</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        ⚙️
                    </div>
                    <div className="admin-stat-info">
                        <h4>{inProgressCount}</h4>
                        <p>In Progress</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        ✅
                    </div>
                    <div className="admin-stat-info">
                        <h4>{resolvedCount}</h4>
                        <p>Resolved</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                        📋
                    </div>
                    <div className="admin-stat-info">
                        <h4>{reports.length}</h4>
                        <p>Total Submissions</p>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <div>
                        <h3>General Reports & Feedback Inquiries</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                            Platform issues, bug reports, spam notices, and user suggestions.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="select-role"
                            style={{ minWidth: 140 }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">⏳ Pending ({pendingCount})</option>
                            <option value="in_progress">⚙️ In Progress ({inProgressCount})</option>
                            <option value="resolved">✅ Resolved ({resolvedCount})</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="select-role"
                            style={{ minWidth: 160 }}
                        >
                            <option value="all">All Categories</option>
                            <option value="technical_issue">🛠️ Technical Issue</option>
                            <option value="fake_profile">👤 Fake Profile</option>
                            <option value="spam">🚫 Spam</option>
                            <option value="feedback">💡 Feedback</option>
                            <option value="other">📝 Other</option>
                        </select>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="🔍 Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: 8,
                                fontSize: '0.85rem',
                                outline: 'none',
                                minWidth: 180
                            }}
                        />

                        <button
                            onClick={fetchReports}
                            className="btn-action secondary"
                            title="Refresh reports"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Submitter</th>
                                <th>Category</th>
                                <th>Subject & Details</th>
                                <th>Date</th>
                                <th>Status Badge</th>
                                <th style={{ textAlign: 'right' }}>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⏳</div>
                                        <div>Loading platform reports...</div>
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🎉</div>
                                        <div>No reports found matching your criteria.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => {
                                    const cat = CATEGORY_LABELS[report.category] || CATEGORY_LABELS.other;
                                    const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                                    const isUpdating = updatingId === report._id;

                                    return (
                                        <tr key={report._id}>
                                            {/* Submitter */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: report.user ? '#dc2626' : '#64748b',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {(report.user?.name || report.name || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                                            {report.user?.name || report.name || 'Anonymous User'}
                                                        </div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                            {report.user?.email || report.email || 'No email provided'}
                                                        </div>
                                                        {report.user && (
                                                            <span style={{
                                                                fontSize: '0.68rem',
                                                                padding: '1px 6px',
                                                                borderRadius: 10,
                                                                background: '#e0f2fe',
                                                                color: '#0284c7',
                                                                fontWeight: 700,
                                                                display: 'inline-block',
                                                                marginTop: 2
                                                            }}>
                                                                Verified Member
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 12,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: cat.bg,
                                                    color: cat.color,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}>
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.label}</span>
                                                </span>
                                            </td>

                                            {/* Subject & Details */}
                                            <td style={{ maxWidth: 300 }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                                                    {report.subject}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.82rem',
                                                    color: '#475569',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {report.description}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: 0,
                                                        marginTop: 4,
                                                        color: '#dc2626',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    View Full Details →
                                                </button>
                                            </td>

                                            {/* Date */}
                                            <td style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(report.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Colorful Status Badge */}
                                            <td>
                                                <span className={`badge-status ${statusCfg.colorClass}`}>
                                                    <span>{statusCfg.icon}</span>
                                                    <span>{statusCfg.label}</span>
                                                </span>
                                            </td>

                                            {/* Status Update Toggle / Selector */}
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <select
                                                        value={report.status}
                                                        disabled={isUpdating}
                                                        onChange={(e) => handleUpdateStatus(report._id, e.target.value)}
                                                        className="select-role"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            padding: '5px 8px',
                                                            background: report.status === 'resolved' ? '#f0fdf4' : report.status === 'in_progress' ? '#fffbeb' : '#fef2f2',
                                                            borderColor: report.status === 'resolved' ? '#86efac' : report.status === 'in_progress' ? '#fde68a' : '#fca5a5'
                                                        }}
                                                    >
                                                        <option value="pending">⏳ Pending</option>
                                                        <option value="in_progress">⚙️ In Progress</option>
                                                        <option value="resolved">✅ Resolved</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 20
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        maxWidth: 600,
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: 28,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                            <div>
                                <span className={`badge-status ${STATUS_CONFIG[selectedReport.status]?.colorClass || 'pending'}`}>
                                    {STATUS_CONFIG[selectedReport.status]?.icon} {STATUS_CONFIG[selectedReport.status]?.label}
                                </span>
                                <h3 style={{ margin: '10px 0 4px', fontSize: '1.25rem', color: '#1e293b' }}>
                                    {selectedReport.subject}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                                    Submitted on {new Date(selectedReport.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    cursor: 'pointer',
                                    fontWeight: 700
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
                            <div><strong>Submitter:</strong> {selectedReport.user?.name || selectedReport.name || 'Anonymous'}</div>
                            <div><strong>Email:</strong> {selectedReport.user?.email || selectedReport.email || 'N/A'}</div>
                            <div><strong>Category:</strong> {CATEGORY_LABELS[selectedReport.category]?.label || selectedReport.category}</div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#334155' }}>Report Description:</h4>
                            <div style={{
                                background: '#fafafa',
                                border: '1px solid #e2e8f0',
                                padding: 14,
                                borderRadius: 10,
                                fontSize: '0.9rem',
                                color: '#1e293b',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedReport.description}
                            </div>
                        </div>

                        {selectedReport.adminNotes && (
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#334155' }}>Admin Notes:</h4>
                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    padding: 12,
                                    borderRadius: 8,
                                    fontSize: '0.85rem',
                                    color: '#166534'
                                }}>
                                    {selectedReport.adminNotes}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                            {selectedReport.status !== 'in_progress' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport._id, 'in_progress')}
                                    className="btn-action warning"
                                >
                                    ⚙️ Mark In Progress
                                </button>
                            )}
                            {selectedReport.status !== 'resolved' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                                    className="btn-action success"
                                >
                                    ✅ Mark Resolved
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="btn-action secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralReports;
