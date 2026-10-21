import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Sidebar from './Sidebar';
import Feed from '../Posts/Feed';
import DonorList from '../Donors/DonorList';
import ChatArea from '../Chat/ChatArea';
import GroupChat from '../Chat/GroupChat';
import BlogList from '../Blog/BlogList';
import ApprovalDashboard from '../Blog/ApprovalDashboard';
import Profile from '../Profile/Profile';
import Footer from '../Common/Footer';
import VerifyEmailBanner from '../Common/VerifyEmailBanner';
import DonationReminder from './DonationReminder';
import Leaderboard from '../Leaderboard/Leaderboard';
import SOSButton from '../SOS/SOSButton';
import AdminDashboard from '../Admin/AdminDashboard';
import ReportIssue from '../Common/ReportIssue';
import './Dashboard.css';

const Dashboard = () => {
    const { logout, isStaff } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('online-users', (users) => setOnlineUsers(users));
        // Immediately fetch current online users list
        socket.emit('get-online-users');

        socket.on('new-request', (req) => {
            setNotifications(prev => [{ id: Date.now(), ...req }, ...prev]);
        });

        return () => {
            socket.off('online-users');
            socket.off('new-request');
        };
    }, [socket]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            {/* Mobile Top Navbar (Visible < 768px for Google AdSense compliance) */}
            <header className="mobile-topbar">
                <button
                    type="button"
                    className="mobile-hamburger-btn"
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    ☰
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '1.05rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>🩸</span>
                    <span>Blood Donation</span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '4px 10px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <span style={{ color: '#22c55e', fontSize: '0.65rem' }}>●</span>
                    <span>{onlineUsers.length} Online</span>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Navigation */}
            <Sidebar
                onLogout={handleLogout}
                onlineCount={onlineUsers.length}
                notificationCount={notifications.length}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
            <main className="main-content">
                <VerifyEmailBanner />
                <DonationReminder />
                <div className="content-body">
                    <Routes>
                        <Route path="/" element={<Navigate to="feed" />} />
                        <Route path="feed" element={<Feed />} />
                        <Route path="donors" element={<DonorList />} />
                        <Route path="chat" element={<ChatArea />} />
                        <Route path="groups" element={<GroupChat />} />
                        <Route path="blog" element={<BlogList />} />
                        <Route path="approvals" element={<Navigate to="/dashboard/admin?tab=posts" replace />} />
                        <Route path="admin" element={
                            isStaff ? <AdminDashboard /> : <Navigate to="/dashboard/feed" replace />
                        } />
                        <Route path="report-issue" element={<ReportIssue />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="leaderboard" element={<Leaderboard />} />
                    </Routes>
                </div>
                <Footer />
            </main>
            {/* 🆕 Floating SOS Button */}
            <SOSButton />
        </div>
    );
};

export default Dashboard;
