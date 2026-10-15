import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DonationHistory from './DonationHistory';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [toggling, setToggling] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info | history

    const avatarUrl = user?.profilePic ||
        `https://ui-avatars.com/api/?name=${user?.name}&background=dc3545&color=fff&size=200`;

    const handleToggleDonor = async () => {
        setToggling(true);
        try {
            const newStatus = !user.isDonorAvailable;
            await api.put('/users/donor-status', { isDonorAvailable: newStatus });
            updateUser({ isDonorAvailable: newStatus });
            toast.success(newStatus ? 'You are now available to donate ✅' : 'Donor status turned off');
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setToggling(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const dataUrl = ev.target.result;
                await api.put('/users/profile-pic', { profilePic: dataUrl });
                updateUser({ profilePic: dataUrl });
                toast.success('Profile picture updated!');
            } catch (err) {
                toast.error('Failed to upload picture');
            }
        };
        reader.readAsDataURL(file);
    };

    const getBadgeEmoji = (badge) => {
        switch (badge) {
            case 'Platinum': return '💎';
            case 'Gold': return '🥇';
            case 'Silver': return '🥈';
            case 'Bronze': return '🥉';
            default: return '🩸';
        }
    };

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-card">
                <div className="profile-header">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={avatarUrl} alt={user?.name} />
                        {user?.badge && user.badge !== 'None' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 10,
                                right: 0,
                                background: 'white',
                                borderRadius: '50%',
                                width: 35,
                                height: 35,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2em',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                                {getBadgeEmoji(user.badge)}
                            </div>
                        )}
                    </div>
                    <h2>{user?.name}</h2>
                    <div className="blood-badge">🩸 {user?.bloodGroup}</div>

                    {user?.isVerified && (
                        <div style={{
                            marginTop: 8,
                            fontSize: '0.8em',
                            color: '#28a745',
                            fontWeight: 600
                        }}>
                            ✅ Verified Donor
                        </div>
                    )}

                    <div style={{ marginTop: 15 }}>
                        <label
                            htmlFor="profile-upload"
                            style={{
                                padding: '6px 16px',
                                background: '#f0f0f0',
                                borderRadius: 20,
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                display: 'inline-block'
                            }}
                        >
                            📷 Change Photo
                        </label>
                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: 20
                }}>
                    <TabButton
                        active={activeTab === 'info'}
                        onClick={() => setActiveTab('info')}
                        icon="👤"
                        label="Profile Info"
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        icon="📜"
                        label="Donation History"
                    />
                </div>

                {/* Tab Content */}
                {activeTab === 'info' && (
                    <>
                        <div className="profile-info-grid">
                            <InfoItem label="Email" value={user?.email} />
                            <InfoItem label="Phone" value={user?.phoneNumber} />
                            <InfoItem label="Age" value={`${user?.age} years`} />
                            <InfoItem label="Gender" value={user?.gender} />
                            <InfoItem label="District" value={user?.district} />
                            <InfoItem label="Total Donations" value={user?.totalDonations || 0} />
                            <InfoItem
                                label="Last Donation"
                                value={user?.lastDonationDate
                                    ? new Date(user.lastDonationDate).toLocaleDateString()
                                    : 'Never'}
                            />
                            <InfoItem
                                label="Next Eligible"
                                value={user?.nextEligibleDate
                                    ? new Date(user.nextEligibleDate).toLocaleDateString()
                                    : 'Now'}
                            />
                            <InfoItem
                                label="Badge"
                                value={getBadgeEmoji(user?.badge) + ' ' + (user?.badge || 'None')}
                            />
                            <InfoItem label="Email Status" value={user?.isEmailVerified ? '✅ Verified' : '⏳ Unverified'} />
                            <InfoItem
                                label="Member Since"
                                value={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            />
                        </div>

                        <div className="donor-toggle">
                            <div>
                                <div className="toggle-label">🩸 Donor Availability</div>
                                <div className="toggle-desc">
                                    Turn on to appear in donor search results
                                </div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={user?.isDonorAvailable || false}
                                    onChange={handleToggleDonor}
                                    disabled={toggling}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </>
                )}

                {activeTab === 'history' && <DonationHistory />}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: active ? '3px solid #dc3545' : '3px solid transparent',
            color: active ? '#dc3545' : '#888',
            fontWeight: active ? 600 : 500,
            fontSize: '0.9em',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <div className="label">{label}</div>
        <div className="value">{value || '—'}</div>
    </div>
);

export default Profile;
