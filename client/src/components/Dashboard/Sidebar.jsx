import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DevCredit from '../Common/DevCredit';
import './Dashboard.css';

const Sidebar = ({ onLogout, onlineCount, notificationCount, isOpen, onClose }) => {
    const { user, isStaff } = useAuth();

    const avatarUrl = user?.profilePic || 
        `https://ui-avatars.com/api/?name=${user?.name}&background=dc3545&color=fff&size=100`;

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin': return { label: 'Super Admin', color: '#f59e0b', icon: '👑' };
            case 'admin': return { label: 'Admin', color: '#ef4444', icon: '🛡️' };
            case 'moderator': return { label: 'Moderator', color: '#8b5cf6', icon: '⚖️' };
            case 'doctor': return { label: 'Doctor', color: '#0ea5e9', icon: '🩺' };
            case 'special_member': return { label: 'Special Member', color: '#10b981', icon: '⭐' };
            default: return null;
        }
    };

    const roleInfo = getRoleBadge(user?.role);

    return (
        <aside className={`dashboard-sidebar ${isOpen ? 'mobile-open' : ''}`}>
            {/* Header with Title and Mobile Close button */}
            <div style={{
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #3d566e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto' }}>
                    <span style={{ fontSize: '1.8rem' }}>🩸</span>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: 'white' }}>Blood Donation</h3>
                </div>

                <button
                    type="button"
                    className="mobile-close-btn"
                    onClick={onClose}
                    aria-label="Close Navigation Menu"
                    style={{ position: 'absolute', right: 10, top: 10 }}
                >
                    ✕
                </button>
            </div>

            {/* User Profile Card */}
            <div style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #3d566e' }}>
                <img
                    src={avatarUrl}
                    alt={user?.name}
                    style={{
                        width: 64, height: 64, borderRadius: '50%',
                        border: '3px solid #dc3545', objectFit: 'cover'
                    }}
                />
                <div style={{ fontWeight: 700, marginTop: 8, fontSize: '0.95rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                    🩸 {user?.bloodGroup} • {user?.district}
                </div>
                {roleInfo && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 6,
                        padding: '3px 10px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.12)',
                        border: `1px solid ${roleInfo.color}`,
                        color: roleInfo.color,
                        fontSize: '0.72rem',
                        fontWeight: 700
                    }}>
                        <span>{roleInfo.icon}</span>
                        <span>{roleInfo.label}</span>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, padding: '15px 10px', overflowY: 'auto' }}>
                <SidebarLink to="/dashboard/feed" icon="📋" label="Blood Requests" onClick={onClose} />
                <SidebarLink to="/dashboard/donors" icon="👥" label="Find Donors" onClick={onClose} />
                <SidebarLink
                    to="/dashboard/chat"
                    icon="💬"
                    label="Chat"
                    badge={onlineCount > 0 ? onlineCount : null}
                    onClick={onClose}
                />
                <SidebarLink to="/dashboard/groups" icon="🩸" label="Group Chats" onClick={onClose} />
                <SidebarLink to="/dashboard/blog" icon="📚" label="Articles & Blog" onClick={onClose} />
                <SidebarLink to="/dashboard/leaderboard" icon="🏆" label="Leaderboard" onClick={onClose} />
                <SidebarLink to="/dashboard/profile" icon="👤" label="My Profile" onClick={onClose} />

                {/* Staff / Admin Section */}
                {isStaff && (
                    <div style={{ marginTop: 15, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#94a3b8',
                            padding: '0 12px 6px',
                            fontWeight: 700
                        }}>
                            {(user?.role === 'super_admin' || user?.role === 'admin') ? 'Administration' : 'Moderation Hub'}
                        </div>

                        {/* User Management: ONLY super_admin and admin */}
                        {(user?.role === 'super_admin' || user?.role === 'admin') && (
                            <SidebarLink to="/dashboard/admin?tab=users" icon="👥" label="User Management" onClick={onClose} />
                        )}

                        {/* Post Management: super_admin, admin, and moderator */}
                        <SidebarLink to="/dashboard/admin?tab=posts" icon="📝" label="Post Management" onClick={onClose} />

                        {/* Reported Articles: super_admin, admin, and moderator */}
                        <SidebarLink to="/dashboard/admin?tab=reported_articles" icon="🚩" label="Reported Articles" onClick={onClose} />

                        {/* General Reports: super_admin, admin, and moderator */}
                        <SidebarLink to="/dashboard/admin?tab=general_reports" icon="📋" label="General Reports" onClick={onClose} />
                    </div>
                )}

                {/* Support & Issue Reporting for all users */}
                <div style={{ marginTop: 15, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <SidebarLink to="/dashboard/report-issue" icon="🛡️" label="Report an Issue" onClick={onClose} />
                </div>
            </nav>

            {/* Footer with touch-friendly 48px logout button */}
            <div style={{ padding: '14px 15px', borderTop: '1px solid #3d566e' }}>
                <button
                    onClick={() => {
                        onClose && onClose();
                        onLogout();
                    }}
                    style={{
                        width: '100%',
                        minHeight: 48,
                        padding: '12px 14px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    🚪 Logout
                </button>
                <div style={{ marginTop: 10 }}>
                    <DevCredit variant="sidebar" />
                </div>
            </div>
        </aside>
    );
};

const SidebarLink = ({ to, icon, label, badge, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            minHeight: '48px', // Minimum 48px tap target for Google AdSense compliance
            marginBottom: 5,
            borderRadius: 10,
            color: isActive ? 'white' : '#cbd5e1',
            background: isActive ? '#dc3545' : 'transparent',
            fontWeight: isActive ? 700 : 500,
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
        })}
    >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.15rem' }}>{icon}</span>
            <span>{label}</span>
        </span>
        {badge && (
            <span style={{
                background: '#e74c3c',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.72rem',
                fontWeight: 700
            }}>{badge}</span>
        )}
    </NavLink>
);

export default Sidebar;
