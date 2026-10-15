import React, { useState } from 'react';
import './Profile.css';

const DonationCard = ({ donation, onViewCertificate }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            style={{
                background: 'white',
                borderRadius: 12,
                padding: '15px 18px',
                marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: '4px solid #dc3545',
                cursor: 'pointer',
                transition: 'transform 0.2s'
            }}
            onClick={() => setExpanded(!expanded)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 45, height: 45,
                        borderRadius: '50%',
                        background: '#dc3545',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3em',
                        fontWeight: 700
                    }}>
                        🩸
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95em' }}>
                            {donation.bloodGroup} • {donation.units || 1} unit
                        </div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                            🏥 {donation.hospital}
                        </div>
                        <div style={{ fontSize: '0.75em', color: '#999', marginTop: 2 }}>
                            📅 {formatDate(donation.donatedAt)} • 📍 {donation.district}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '0.7em',
                        color: '#dc3545',
                        fontWeight: 600,
                        background: '#fce4ec',
                        padding: '3px 8px',
                        borderRadius: 10
                    }}>
                        {donation.certificateId || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.7em', color: '#999', marginTop: 4 }}>
                        {expanded ? '▲ Hide' : '▼ Details'}
                    </div>
                </div>
            </div>

            {expanded && (
                <div style={{
                    marginTop: 15,
                    paddingTop: 15,
                    borderTop: '1px solid #f0f0f0'
                }}>
                    {donation.recipient && (
                        <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '0.8em', color: '#666' }}>👤 Recipient: </span>
                            <span style={{ fontWeight: 500 }}>
                                {donation.recipient.name || 'Anonymous'}
                            </span>
                        </div>
                    )}

                    {donation.notes && (
                        <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '0.8em', color: '#666' }}>📝 Notes: </span>
                            <span>{donation.notes}</span>
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewCertificate?.(donation);
                        }}
                        style={{
                            marginTop: 8,
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: '0.85em',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        🏆 View Certificate
                    </button>
                </div>
            )}
        </div>
    );
};

export default DonationCard;
