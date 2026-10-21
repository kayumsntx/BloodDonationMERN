import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import ReportedArticles from './ReportedArticles';
import GeneralReports from './GeneralReports';
import './Admin.css';

const AdminDashboard = () => {
    const { user, isStaff, isAdmin, isSuperAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Available tabs based on RBAC
    // super_admin & admin: all 4 tabs
    // moderator: Post Management, Reported Articles, General Reports (User Management completely hidden)
    const canManageUsers = isSuperAdmin || user?.role === 'admin';

    const defaultTab = canManageUsers ? 'users' : 'posts';
    const currentTab = searchParams.get('tab') || defaultTab;

    // Safety check: if a moderator tries to access tab=users, redirect to posts
    useEffect(() => {
        if (!isStaff) {
            navigate('/dashboard');
            return;
        }

        if (currentTab === 'users' && !canManageUsers) {
            setSearchParams({ tab: 'posts' });
        }
    }, [currentTab, canManageUsers, isStaff, navigate, setSearchParams]);

    const handleTabChange = (tabKey) => {
        setSearchParams({ tab: tabKey });
    };

    const getRoleDetails = (role) => {
        switch (role) {
            case 'super_admin':
                return { label: 'Super Admin', icon: '👑', pillClass: 'super_admin', desc: 'Full System & Access Privileges' };
            case 'admin':
                return { label: 'Admin', icon: '🛡️', pillClass: 'admin', desc: 'User & Content Administration' };
            case 'moderator':
                return { label: 'Moderator', icon: '⚖️', pillClass: 'moderator', desc: 'Content & Community Moderation' };
            default:
                return { label: role, icon: '👤', pillClass: '', desc: 'Standard Staff' };
        }
    };

    const roleInfo = getRoleDetails(user?.role);

    return (
        <div className="admin-container">
            {/* Top Navigation & Role Banner */}
            <div className="admin-header-card">
                <div className="admin-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                        <div>
                            <h2>Staff & Administration Hub</h2>
                            <p>Control users, review community submissions, verify medical articles, and manage safety reports.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {roleInfo.desc}
                        </div>
                    </div>

                    <div className={`admin-role-pill ${roleInfo.pillClass}`}>
                        <span>{roleInfo.icon}</span>
                        <span>{roleInfo.label}</span>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="admin-nav-tabs">
                {canManageUsers && (
                    <button
                        className={`admin-nav-tab ${currentTab === 'users' ? 'active' : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        <span>👥</span>
                        <span>User Management</span>
                    </button>
                )}

                <button
                    className={`admin-nav-tab ${currentTab === 'posts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('posts')}
                >
                    <span>📝</span>
                    <span>Post Management</span>
                </button>

                <button
                    className={`admin-nav-tab ${currentTab === 'reported_articles' ? 'active' : ''}`}
                    onClick={() => handleTabChange('reported_articles')}
                >
                    <span>🚩</span>
                    <span>Reported Articles</span>
                </button>

                <button
                    className={`admin-nav-tab ${currentTab === 'general_reports' ? 'active' : ''}`}
                    onClick={() => handleTabChange('general_reports')}
                >
                    <span>📋</span>
                    <span>General Reports</span>
                </button>
            </div>

            {/* Active Tab View */}
            <div className="admin-tab-content">
                {currentTab === 'users' && canManageUsers && <UserManagement />}
                {currentTab === 'posts' && <PostManagement />}
                {currentTab === 'reported_articles' && <ReportedArticles />}
                {currentTab === 'general_reports' && <GeneralReports />}
            </div>
        </div>
    );
};

export default AdminDashboard;
