import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DevCredit from '../Common/DevCredit';
import './Dashboard.css';

const Sidebar = ({ onLogout, onlineCount, notificationCount }) => {
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
        <div style={{
            width: 260,
            background: '#2c3e50',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            flexShrink: 0
        }}>
            <div style={{ padding: 20, textAlign: 'center', borderBottom: '1px solid #3d566e' }}>
                <div style={{ fontSize: '2em' }}>🩸</div>
                <h3 style={{ fontSize: '1.1em', marginTop: 5 }}>Blood Donation</h3>
            </div>

            <div style={{ padding: 20, textAlign: 'center', borderBottom: '1px solid #3d566e' }}>
                <img
                    src={avatarUrl}
                    alt={user?.name}
                    style={{
                        width: 70, height: 70, borderRadius: '50%',
                        border: '3px solid #dc3545', objectFit: 'cover'
                    }}
                />
                <div style={{ fontWeight: 600, marginTop: 8 }}>{user?.name}</div>
                <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: 2 }}>
                    🩸 {user?.bloodGroup} • {user?.district}
                </div>
                {roleInfo && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 6,
                        padding: '2px 8px',
                        borderRadius: 12,
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

            <nav style={{ flex: 1, padding: '15px 10px', overflowY: 'auto' }}>
                <SidebarLink to="/dashboard/feed" icon="📋" label="Blood Requests" />
                <SidebarLink to="/dashboard/donors" icon="👥" label="Find Donors" />
                <SidebarLink
                    to="/dashboard/chat"
                    icon="💬"
                    label="Chat"
                    badge={onlineCount > 0 ? onlineCount : null}
                />
                <SidebarLink to="/dashboard/groups" icon="🩸" label="Group Chats" />
                <SidebarLink to="/dashboard/blog" icon="📚" label="Articles & Blog" />
                {isStaff && (
                    <SidebarLink to="/dashboard/approvals" icon="🛡️" label="Approval Dashboard" />
                )}
                <SidebarLink to="/dashboard/leaderboard" icon="🏆" label="Leaderboard" />
                <SidebarLink to="/dashboard/profile" icon="👤" label="My Profile" />
            </nav>

            <div style={{ padding: '12px 15px', borderTop: '1px solid #3d566e' }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%', padding: 10,
                        background: '#e74c3c', color: 'white',
                        border: 'none', borderRadius: 8,
                        cursor: 'pointer', fontSize: '0.9em',
                        marginBottom: 10
                    }}
                >
                    🚪 Logout
                </button>
                <div style={{ marginTop: 12 }}>
                    <DevCredit variant="sidebar" />
                </div>
            </div>
        </div>
    );
};

const SidebarLink = ({ to, icon, label, badge }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 15px',
            marginBottom: 5,
            borderRadius: 8,
            color: isActive ? 'white' : '#aaa',
            background: isActive ? '#dc3545' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            transition: 'all 0.3s'
        })}
    >
        <span>{icon} {label}</span>
        {badge && (
            <span style={{
                background: '#e74c3c',
                color: 'white',
                padding: '1px 8px',
                borderRadius: 12,
                fontSize: '0.7em'
            }}>{badge}</span>
        )}
    </NavLink>
);

export default Sidebar;
