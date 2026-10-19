import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import BadgeCard from './BadgeCard';
import BadgeProgress from './BadgeProgress';

const BadgeShowcase = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBadges();
    }, []);

    const loadBadges = async () => {
        try {
            const { data } = await api.get('/badges/my');
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                Loading badges...
            </div>
        );
    }

    if (!data) return null;

    return (
        <div>
            {/* Current Badge */}
            <div style={{
                background: `linear-gradient(135deg, ${data.currentBadge.color}22, ${data.currentBadge.color}44)`,
                borderRadius: 15,
                padding: 25,
                textAlign: 'center',
                marginBottom: 20,
                border: `2px solid ${data.currentBadge.color}`
            }}>
                <div style={{ fontSize: '4em', marginBottom: 10 }}>
                    {data.currentBadge.icon}
                </div>
                <h2 style={{
                    fontSize: '1.4em',
                    color: data.currentBadge.color,
                    marginBottom: 5,
                    fontWeight: 700
                }}>
                    {data.currentBadge.name}
                </h2>
                <p style={{
                    fontSize: '0.9em',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    "{data.currentBadge.description}"
                </p>
                <div style={{
                    marginTop: 12,
                    fontSize: '0.85em',
                    color: '#666'
                }}>
                    Total donations: <strong style={{ color: '#dc3545' }}>
                        {data.totalDonations}
                    </strong>
                </div>
            </div>

            {/* Progress to Next */}
            <div style={{ marginBottom: 25 }}>
                <BadgeProgress
                    progress={data.progress}
                    currentBadge={data.currentBadge}
                />
            </div>

            {/* All Badges */}
            <div>
                <h3 style={{
                    fontSize: '1.1em',
                    color: '#2c3e50',
                    marginBottom: 15
                }}>
                    🏆 All Achievements
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 12
                }}>
                    {data.allBadges.map(badge => (
                        <BadgeCard key={badge.key} badge={badge} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BadgeShowcase;
