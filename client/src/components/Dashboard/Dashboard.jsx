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

    useEffect(() => {
        if (!socket) return;

        socket.on('online-users', (users) => setOnlineUsers(users));

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
            <Sidebar
                onLogout={handleLogout}
                onlineCount={onlineUsers.length}
                notificationCount={notifications.length}
            />
            <div className="main-content">
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
            </div>
            {/* 🆕 Floating SOS Button */}
            <SOSButton />
        </div>
    );
};

export default Dashboard;
