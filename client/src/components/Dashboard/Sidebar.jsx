import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Sidebar = ({ onLogout, onlineCount, notificationCount }) => {
    const { user } = useAuth();

    const avatarUrl = user?.profilePic || 
        `https://ui-avatars.com/api/?name=${user?.name}&background=dc3545&color=fff&size=100`;

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
                <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                    🩸 {user?.bloodGroup} • {user?.district}
                </div>
            </div>

            <nav style={{ flex: 1, padding: '15px 10px' }}>
                <SidebarLink to="/dashboard/feed" icon="📋" label="Blood Requests" />
                <SidebarLink to="/dashboard/donors" icon="👥" label="Find Donors" />
                <SidebarLink
                    to="/dashboard/chat"
                    icon="💬"
                    label="Chat"
                    badge={onlineCount > 0 ? onlineCount : null}
                />
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
                <div style={{
                    textAlign: 'center',
                    fontSize: '0.72em',
                    color: '#94a3b8',
                    lineHeight: 1.45,
                    borderTop: '1px dashed #3d566e',
                    paddingTop: 8
                }}>
                    <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Developed By
                    </div>
                    <a
                        href="https://www.facebook.com/asmatechsolutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, color: '#f1f5f9', textDecoration: 'none', display: 'inline-block' }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                        ASMA Computer and IT Solutions
                    </a>
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
