import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'];

const UserManagement = () => {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [updatingId, setUpdatingId] = useState(null);

    // Modal States
    const [suspendModalUser, setSuspendModalUser] = useState(null);
    const [suspendDuration, setSuspendDuration] = useState('7');
    const [suspendCustomDate, setSuspendCustomDate] = useState('');
    const [suspendReason, setSuspendReason] = useState('');

    const [banModalUser, setBanModalUser] = useState(null);
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/users');
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error(error.response?.data?.message || 'Failed to load user records');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!isSuperAdmin) {
            toast.error('Only a Super Admin can change user roles.');
            return;
        }

        setUpdatingId(userId);
        try {
            const { data } = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success(data.message || 'User role updated! 🎉');
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Role update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update user role');
        } finally {
            setUpdatingId(null);
        }
    };

    // Open Suspend Modal
    const openSuspendModal = (user) => {
        setSuspendModalUser(user);
        setSuspendDuration('7');
        setSuspendCustomDate('');
        setSuspendReason('');
    };

    const closeSuspendModal = () => {
        setSuspendModalUser(null);
    };

    // Submit Durational Suspension
    const handleSuspendSubmit = async (e) => {
        e.preventDefault();
        if (!suspendModalUser) return;

        if (suspendDuration === 'custom' && !suspendCustomDate) {
            toast.error('Please select a custom expiration date.');
            return;
        }

        if (!suspendReason.trim()) {
            toast.error('Please provide a reason for suspension.');
            return;
        }

        setUpdatingId(suspendModalUser._id);
        try {
            const payload = {
                status: 'suspended',
                durationDays: suspendDuration,
                suspendedUntil: suspendDuration === 'custom' ? suspendCustomDate : undefined,
                reason: suspendReason.trim()
            };

            const { data } = await api.put(`/admin/users/${suspendModalUser._id}/status`, payload);
            toast.success(data.message || 'User suspended successfully.');
            setUsers(prev => prev.map(u => u._id === suspendModalUser._id ? { ...u, ...data.user } : u));
            closeSuspendModal();
        } catch (error) {
            console.error('Suspension error:', error);
            toast.error(error.response?.data?.message || 'Failed to suspend user');
        } finally {
            setUpdatingId(null);
        }
    };

    // Open Ban Modal
    const openBanModal = (user) => {
        setBanModalUser(user);
        setBanReason('');
    };

    const closeBanModal = () => {
        setBanModalUser(null);
    };

    // Submit Permanent Ban
    const handleBanSubmit = async (e) => {
        e.preventDefault();
        if (!banModalUser) return;

        if (!banReason.trim()) {
            toast.error('Please specify a reason for banning this account.');
            return;
        }

        setUpdatingId(banModalUser._id);
        try {
            const { data } = await api.put(`/admin/users/${banModalUser._id}/status`, {
                status: 'banned',
                reason: banReason.trim()
            });
            toast.success(data.message || 'User permanently banned.');
            setUsers(prev => prev.map(u => u._id === banModalUser._id ? { ...u, ...data.user } : u));
            closeBanModal();
        } catch (error) {
            console.error('Ban error:', error);
            toast.error(error.response?.data?.message || 'Failed to ban user');
        } finally {
            setUpdatingId(null);
        }
    };

    // Unsuspend / Reactivate User
    const handleReactivate = async (targetUser) => {
        const isSuspended = targetUser.status === 'suspended';
        const actionLabel = isSuspended ? 'unsuspend and restore access for' : 'reactivate';

        if (!window.confirm(`Are you sure you want to ${actionLabel} ${targetUser.name}?`)) {
            return;
        }

        setUpdatingId(targetUser._id);
        try {
            const { data } = await api.put(`/admin/users/${targetUser._id}/status`, {
                status: 'active'
            });
            toast.success(data.message || `User account reactivated! ✅`);
            setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, ...data.user } : u));
        } catch (error) {
            console.error('Reactivation error:', error);
            toast.error(error.response?.data?.message || 'Failed to reactivate account');
        } finally {
            setUpdatingId(null);
        }
    };

    // Format remaining days
    const getSuspensionBadgeInfo = (suspendedUntil) => {
        if (!suspendedUntil) return null;
        const until = new Date(suspendedUntil);
        const diffMs = until.getTime() - Date.now();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { text: 'Expired (will unsuspend on next login)', isExpired: true };
        }
        return {
            text: `${until.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (${diffDays}d left)`,
            isExpired: false
        };
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
            (u.district && u.district.toLowerCase().includes(search.toLowerCase())) ||
            (u.bloodGroup && u.bloodGroup.toLowerCase().includes(search.toLowerCase()));

        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || (u.status || 'active') === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return (
        <div className="admin-card">
            {/* Header with Search & Filters */}
            <div className="admin-card-header">
                <div>
                    <h3>👥 User Management</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Total users: {users.length} {isSuperAdmin ? '(Super Admin Full Access)' : '(Admin Restricted Access)'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 Search name, email, district..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            outline: 'none',
                            minWidth: 200
                        }}
                    />

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="select-role"
                    >
                        <option value="All">All Roles</option>
                        {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="select-role"
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>

                    <button
                        onClick={loadUsers}
                        className="btn-action secondary"
                        title="Reload users"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⏳</div>
                        <div>Loading user accounts...</div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔍</div>
                        <div>No users found matching your filters.</div>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Profile</th>
                                <th>Blood Group & District</th>
                                <th>Role Permission</th>
                                <th>Account Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => {
                                const isSelf = currentUser?._id === u._id;
                                const isTargetSuperAdmin = u.role === 'super_admin';
                                const currentStatus = u.status || 'active';
                                const suspInfo = currentStatus === 'suspended' ? getSuspensionBadgeInfo(u.suspendedUntil) : null;

                                return (
                                    <tr key={u._id} style={{ opacity: currentStatus === 'banned' ? 0.65 : 1 }}>
                                        {/* User Details */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <img
                                                    src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=dc3545&color=fff`}
                                                    alt={u.name}
                                                    style={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: currentStatus === 'banned' ? '2px solid #ef4444' : currentStatus === 'suspended' ? '2px solid #f59e0b' : '2px solid #e2e8f0'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span>{u.name}</span>
                                                        {isSelf && (
                                                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: '#dcfce7', color: '#15803d', borderRadius: 10 }}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Blood Group & District */}
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '2px 8px',
                                                borderRadius: 6,
                                                background: '#fee2e2',
                                                color: '#b91c1c',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                marginRight: 6
                                            }}>
                                                🩸 {u.bloodGroup || 'N/A'}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                📍 {u.district || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Role Dropdown */}
                                        <td>
                                            <select
                                                value={u.role || 'user'}
                                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                                disabled={!isSuperAdmin || isSelf || updatingId === u._id}
                                                className="select-role"
                                                title={!isSuperAdmin ? 'Only Super Admin can change roles' : 'Change user role'}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Status Badge & Period */}
                                        <td>
                                            <div>
                                                <span className={`badge-status ${currentStatus}`}>
                                                    {currentStatus === 'active' && '● Active'}
                                                    {currentStatus === 'suspended' && '⏸ Suspended'}
                                                    {currentStatus === 'banned' && '🚫 Banned'}
                                                </span>

                                                {/* Durational Suspension Subtitle */}
                                                {currentStatus === 'suspended' && (
                                                    <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                                                        {suspInfo ? (
                                                            <div>⏳ {suspInfo.text}</div>
                                                        ) : (
                                                            <div>⏳ Indefinite suspension</div>
                                                        )}
                                                        {u.suspensionReason && (
                                                            <div style={{ color: '#64748b', fontSize: '0.72rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.suspensionReason}>
                                                                Reason: {u.suspensionReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Ban Reason Subtitle */}
                                                {currentStatus === 'banned' && u.banReason && (
                                                    <div style={{ marginTop: 4, fontSize: '0.72rem', color: '#991b1b', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.banReason}>
                                                        Reason: {u.banReason}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: 'right' }}>
                                            {!isSelf && !isTargetSuperAdmin && (
                                                <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                    {currentStatus === 'active' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn-action warning"
                                                                onClick={() => openSuspendModal(u)}
                                                                disabled={updatingId === u._id}
                                                                title="Suspend account for a period"
                                                            >
                                                                ⏸️ Suspend
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action danger"
                                                                onClick={() => openBanModal(u)}
                                                                disabled={updatingId === u._id}
                                                                title="Permanently ban account"
                                                            >
                                                                🚫 Ban
                                                            </button>
                                                        </>
                                                    )}

                                                    {currentStatus === 'suspended' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn-action success"
                                                                onClick={() => handleReactivate(u)}
                                                                disabled={updatingId === u._id}
                                                                title="Unsuspend and restore user access immediately"
                                                            >
                                                                ✅ Unsuspend
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action danger"
                                                                onClick={() => openBanModal(u)}
                                                                disabled={updatingId === u._id}
                                                                title="Escalate to permanent ban"
                                                            >
                                                                🚫 Ban
                                                            </button>
                                                        </>
                                                    )}

                                                    {currentStatus === 'banned' && (
                                                        <button
                                                            type="button"
                                                            className="btn-action success"
                                                            onClick={() => handleReactivate(u)}
                                                            disabled={updatingId === u._id}
                                                            title="Reactivate banned account"
                                                        >
                                                            🔄 Reactivate
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ========== 1. PERIODIC / DURATIONAL SUSPEND MODAL (PackBang Style) ========== */}
            {suspendModalUser && (
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
                        maxWidth: 520,
                        width: '100%',
                        padding: 28,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #fed7aa'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>⏸️</span>
                                    <span>Suspend User Account</span>
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Suspending user <strong style={{ color: '#1e293b' }}>{suspendModalUser.name}</strong> ({suspendModalUser.email}).
                                    Suspended users are instantly blocked from posting, requesting blood, or chatting during this period.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeSuspendModal}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSuspendSubmit} style={{ marginTop: 18 }}>
                            {/* Suspension Duration Options */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Suspension Period Duration <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    value={suspendDuration}
                                    onChange={e => setSuspendDuration(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="7">7 Days (1 Week)</option>
                                    <option value="15">15 Days</option>
                                    <option value="30">30 Days (1 Month)</option>
                                    <option value="60">60 Days (2 Months)</option>
                                    <option value="custom">📅 Custom Date Until...</option>
                                </select>
                            </div>

                            {/* Custom Date Input (revealed when custom selected) */}
                            {suspendDuration === 'custom' && (
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Suspend Until Date <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        min={tomorrowStr}
                                        value={suspendCustomDate}
                                        onChange={e => setSuspendCustomDate(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Suspension Reason */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Suspension Reason <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    value={suspendReason}
                                    onChange={e => setSuspendReason(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Specify reason (e.g. Failure to attend committed blood donation appointment, inappropriate messages, spam, or community guideline violation)..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        lineHeight: 1.5
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={closeSuspendModal}
                                    className="btn-action secondary"
                                    style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-action warning"
                                    disabled={updatingId === suspendModalUser._id}
                                    style={{ padding: '9px 20px', fontSize: '0.88rem', fontWeight: 700 }}
                                >
                                    {updatingId === suspendModalUser._id ? 'Suspending...' : 'Confirm Suspension'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== 2. PERMANENT BAN MODAL ========== */}
            {banModalUser && (
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
                        maxWidth: 500,
                        width: '100%',
                        padding: 28,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>🚫</span>
                                    <span>Permanently Ban Account</span>
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Permanently banning <strong style={{ color: '#1e293b' }}>{banModalUser.name}</strong> ({banModalUser.email}).
                                    This user will be permanently blocked from accessing the platform.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeBanModal}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleBanSubmit} style={{ marginTop: 18 }}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Ban Reason <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    value={banReason}
                                    onChange={e => setBanReason(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Specify severe violation (e.g. Fraudulent medical requests, harassment, impersonation, severe safety violations)..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        lineHeight: 1.5
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={closeBanModal}
                                    className="btn-action secondary"
                                    style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-action danger"
                                    disabled={updatingId === banModalUser._id}
                                    style={{ padding: '9px 20px', fontSize: '0.88rem', fontWeight: 700 }}
                                >
                                    {updatingId === banModalUser._id ? 'Banning...' : 'Confirm Permanent Ban'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
