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

    const handleStatusChange = async (targetUser, newStatus) => {
        const actionText = newStatus === 'banned' ? 'permanently ban' : (newStatus === 'suspended' ? 'temporarily suspend' : 'reactivate');
        const confirmMsg = `Are you sure you want to ${actionText} ${targetUser.name}?`;

        if (!window.confirm(confirmMsg)) return;

        let reason = '';
        if (newStatus !== 'active') {
            reason = window.prompt(`Enter reason to ${actionText} this user:`, 'Violation of community policies') || '';
        }

        setUpdatingId(targetUser._id);
        try {
            const { data } = await api.put(`/admin/users/${targetUser._id}/status`, {
                status: newStatus,
                reason
            });
            toast.success(data.message || `User status changed to ${newStatus}`);
            setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error('Status update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update user status');
        } finally {
            setUpdatingId(null);
        }
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
                    <input
                        type="text"
                        placeholder="Search name, email, district..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            minWidth: 200
                        }}
                    />

                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
                        Loading user records...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        No users match your filter criteria.
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Profile</th>
                                <th>Contact & Location</th>
                                <th>Blood Group</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => {
                                const currentStatus = u.status || 'active';
                                const isTargetSuperAdmin = u.role === 'super_admin';
                                const isSelf = u._id === currentUser?._id;

                                return (
                                    <tr key={u._id}>
                                        {/* User Name & Avatar */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img
                                                    src={u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=dc3545&color=fff&size=40`}
                                                    alt={u.name}
                                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                                        {u.name} {isSelf && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>(You)</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact & District */}
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{u.phoneNumber || '—'}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📍 {u.district || 'Unspecified'}</div>
                                        </td>

                                        {/* Blood Group */}
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: 8, fontSize: '0.82rem' }}>
                                                🩸 {u.bloodGroup}
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

                                        {/* Status Badge */}
                                        <td>
                                            <span className={`badge-status ${currentStatus}`}>
                                                {currentStatus === 'active' && '● Active'}
                                                {currentStatus === 'suspended' && '⏸ Suspended'}
                                                {currentStatus === 'banned' && '🚫 Banned'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: 'right' }}>
                                            {!isSelf && !isTargetSuperAdmin && (
                                                <div style={{ display: 'inline-flex', gap: 6 }}>
                                                    {currentStatus === 'active' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn-action warning"
                                                                onClick={() => handleStatusChange(u, 'suspended')}
                                                                disabled={updatingId === u._id}
                                                                title="Suspend account"
                                                            >
                                                                Suspend
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action danger"
                                                                onClick={() => handleStatusChange(u, 'banned')}
                                                                disabled={updatingId === u._id}
                                                                title="Ban account"
                                                            >
                                                                Ban
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn-action success"
                                                            onClick={() => handleStatusChange(u, 'active')}
                                                            disabled={updatingId === u._id}
                                                            title="Reactivate account"
                                                        >
                                                            Reactivate ✅
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
        </div>
    );
};

export default UserManagement;
