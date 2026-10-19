import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Leaderboard.css';

const TABS = [
    { key: 'all-time', label: '🏆 All Time', endpoint: '/leaderboard/all-time' },
    { key: 'monthly', label: '📅 This Month', endpoint: '/leaderboard/monthly' }
];

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('all-time');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [activeTab]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const tab = TABS.find(t => t.key === activeTab);
            const { data } = await api.get(tab.endpoint);
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (rank) => {
        if (rank === 1) return '#ffd700';
        if (rank === 2) return '#c0c0c0';
        if (rank === 3) return '#cd7f32';
        return '#e0e0e0';
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const leaderboard = data?.leaderboard || [];
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Leaderboard</h2>
                <p style={{ color: '#666', fontSize: '0.9em', marginTop: 5 }}>
                    Top blood donors making a difference
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 20,
                borderBottom: '1px solid #e0e0e0'
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '10px 18px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.key
                                ? '3px solid #dc3545'
                                : '3px solid transparent',
                            color: activeTab === tab.key ? '#dc3545' : '#888',
                            fontWeight: activeTab === tab.key ? 700 : 500,
                            fontSize: '0.9em',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                    Loading leaderboard...
                </div>
            ) : leaderboard.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 60,
                    background: 'white',
                    borderRadius: 12
                }}>
                    <div style={{ fontSize: '3em', marginBottom: 10 }}>🏆</div>
                    <h3 style={{ color: '#2c3e50' }}>No donations yet</h3>
                    <p style={{ color: '#888' }}>Be the first to appear here!</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {top3.length > 0 && (
                        <div className="podium">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <PodiumCard
                                    donor={top3[1]}
                                    rank={2}
                                    height={100}
                                />
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <PodiumCard
                                    donor={top3[0]}
                                    rank={1}
                                    height={140}
                                />
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <PodiumCard
                                    donor={top3[2]}
                                    rank={3}
                                    height={80}
                                />
                            )}
                        </div>
                    )}

                    {/* Rest of leaderboard */}
                    {rest.length > 0 && (
                        <div style={{ marginTop: 30 }}>
                            {rest.map(donor => (
                                <LeaderboardRow
                                    key={donor._id}
                                    donor={donor}
                                    activeTab={activeTab}
                                />
                            ))}
                        </div>
                    )}

                    {/* My Rank */}
                    {activeTab === 'all-time' && data?.myRank && (
                        <div style={{
                            marginTop: 20,
                            padding: 15,
                            background: '#fce4ec',
                            borderRadius: 12,
                            border: '2px solid #dc3545',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                Your Rank
                            </div>
                            <div style={{
                                fontSize: '2em',
                                fontWeight: 700,
                                color: '#dc3545'
                            }}>
                                #{data.myRank}
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                out of {data.totalDonors} donors
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const PodiumCard = ({ donor, rank, height }) => {
    const avatar = donor.profilePic ||
        `https://ui-avatars.com/api/?name=${donor.name}&background=dc3545&color=fff&size=100`;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
        }}>
            <img
                src={avatar}
                alt={donor.name}
                style={{
                    width: rank === 1 ? 80 : 65,
                    height: rank === 1 ? 80 : 65,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `4px solid ${rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32'}`,
                    marginBottom: 8
                }}
            />
            <div style={{
                fontWeight: 700,
                fontSize: rank === 1 ? '1em' : '0.9em',
                color: '#2c3e50',
                marginBottom: 2,
                textAlign: 'center'
            }}>
                {donor.name}
            </div>
            <div style={{
                fontSize: '0.75em',
                color: '#888',
                marginBottom: 8
            }}>
                {donor.bloodGroup}
            </div>
            <div style={{
                width: '100%',
                height,
                background: rank === 1
                    ? 'linear-gradient(180deg, #ffd700, #ffb300)'
                    : rank === 2
                    ? 'linear-gradient(180deg, #e0e0e0, #b0b0b0)'
                    : 'linear-gradient(180deg, #cd7f32, #a65d1f)',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: 10,
                color: 'white',
                fontWeight: 700,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
                <div style={{ fontSize: '1.5em', marginBottom: 2 }}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontSize: '1.2em' }}>
                    {donor.totalDonations || donor.monthlyDonations}
                </div>
                <div style={{ fontSize: '0.7em', opacity: 0.9 }}>
                    donations
                </div>
            </div>
        </div>
    );
};

const LeaderboardRow = ({ donor, activeTab }) => {
    const avatar = donor.profilePic ||
        `https://ui-avatars.com/api/?name=${donor.name}&background=dc3545&color=fff&size=100`;

    const donationCount = activeTab === 'monthly'
        ? donor.monthlyDonations
        : donor.totalDonations;

    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '12px 15px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                width: 35,
                height: 35,
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#666',
                fontSize: '0.9em'
            }}>
                {donor.rank}
            </div>

            <img
                src={avatar}
                alt={donor.name}
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    objectFit: 'cover'
                }}
            />

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95em', color: '#2c3e50' }}>
                    {donor.name}
                </div>
                <div style={{ fontSize: '0.75em', color: '#888' }}>
                    🩸 {donor.bloodGroup} • 📍 {donor.district}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{
                    fontSize: '1.2em',
                    fontWeight: 700,
                    color: '#dc3545'
                }}>
                    {donationCount}
                </div>
                <div style={{ fontSize: '0.7em', color: '#888' }}>
                    donations
                </div>
            </div>

            {donor.badgeInfo && (
                <div style={{
                    fontSize: '1.5em',
                    marginLeft: 8
                }}>
                    {donor.badgeInfo.icon}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
