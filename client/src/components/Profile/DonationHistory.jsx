import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DonationCard from './DonationCard';
import Certificate from './Certificate';
import './Profile.css';

const DonationHistory = () => {
    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [historyRes, statsRes] = await Promise.all([
                api.get('/donations/my'),
                api.get('/donations/stats')
            ]);
            setDonations(historyRes.data.donations || []);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to load donations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                Loading donation history...
            </div>
        );
    }

    return (
        <div>
            {/* Stats Grid */}
            {stats && (
                <div className="stats-grid">
                    <StatCard
                        icon="🩸"
                        value={stats.totalDonations}
                        label="Total Donations"
                        color="#dc3545"
                    />
                    <StatCard
                        icon="💉"
                        value={stats.totalUnits}
                        label="Units Donated"
                        color="#e74c3c"
                    />
                    <StatCard
                        icon="❤️"
                        value={stats.livesSaved}
                        label="Lives Saved"
                        color="#e91e63"
                    />
                    <StatCard
                        icon="🏆"
                        value={stats.totalDonations >= 10 ? 'Gold' : 
                               stats.totalDonations >= 4 ? 'Silver' : 
                               stats.totalDonations >= 1 ? 'Bronze' : 'None'}
                        label="Current Badge"
                        color="#ffc107"
                    />
                </div>
            )}

            {/* Recent Donations */}
            <div style={{ marginTop: 25 }}>
                <h3 style={{ color: '#2c3e50', marginBottom: 15, fontSize: '1.1em' }}>
                    📋 Donation History ({donations.length})
                </h3>

                {donations.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '50px 20px',
                        background: 'white',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '3em', marginBottom: 10 }}>🩸</div>
                        <h4 style={{ color: '#2c3e50' }}>No donations yet</h4>
                        <p style={{ color: '#888', fontSize: '0.9em', marginTop: 5 }}>
                            Start your journey of saving lives!
                        </p>
                    </div>
                ) : (
                    donations.map(d => (
                        <DonationCard
                            key={d._id}
                            donation={d}
                            onViewCertificate={setSelectedDonation}
                        />
                    ))
                )}
            </div>

            {/* Certificate Modal */}
            {selectedDonation && (
                <Certificate
                    donation={selectedDonation}
                    onClose={() => setSelectedDonation(null)}
                />
            )}
        </div>
    );
};

const StatCard = ({ icon, value, label, color }) => (
    <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '18px 15px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderTop: `3px solid ${color}`
    }}>
        <div style={{ fontSize: '1.8em', marginBottom: 5 }}>{icon}</div>
        <div style={{ fontSize: '1.5em', fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: '0.75em', color: '#888', textTransform: 'uppercase', marginTop: 4, fontWeight: 600 }}>
            {label}
        </div>
    </div>
);

export default DonationHistory;
