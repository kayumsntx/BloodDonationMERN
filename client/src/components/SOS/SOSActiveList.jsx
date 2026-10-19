import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SOSActiveList = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActiveSOS();
        // Refresh every 30 seconds
        const interval = setInterval(loadActiveSOS, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadActiveSOS = async () => {
        try {
            const { data } = await api.get('/sos/active');
            setAlerts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (sosId) => {
        try {
            await api.post(`/sos/${sosId}/respond`, {
                message: "I'm on my way!"
            });
            toast.success('Response sent!');
            loadActiveSOS();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                Loading active SOS alerts...
            </div>
        );
    }

    if (alerts.length === 0) return null;

    return (
        <div style={{ marginBottom: 25 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12
            }}>
                <span style={{
                    fontSize: '1.3em',
                    animation: 'pulse 1.5s infinite'
                }}>🚨</span>
                <h3 style={{
                    color: '#c0392b',
                    fontSize: '1.1em',
                    margin: 0
                }}>
                    Active Emergency Alerts ({alerts.length})
                </h3>
            </div>

            {alerts.map(sos => {
                const isOwn = sos.isOwn;
                const hasResponded = sos.hasResponded;

                return (
                    <div
                        key={sos._id}
                        style={{
                            background: 'linear-gradient(to right, #fff5f5, white)',
                            border: '2px solid #e74c3c',
                            borderRadius: 12,
                            padding: 15,
                            marginBottom: 10
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img
                                    src={sos.requester?.profilePic ||
                                        `https://ui-avatars.com/api/?name=${sos.requester?.name}&background=dc3545&color=fff&size=50`}
                                    alt=""
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95em' }}>
                                        {sos.requester?.name}
                                        {isOwn && <span style={{ color: '#dc3545', marginLeft: 5 }}>(You)</span>}
                                    </div>
                                    <div style={{ fontSize: '0.75em', color: '#888' }}>
                                        🕐 {new Date(sos.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                            <span style={{
                                background: '#e74c3c',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: 15,
                                fontSize: '0.8em',
                                fontWeight: 700,
                                height: 'fit-content'
                            }}>
                                🩸 {sos.bloodGroup}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.85em', color: '#444', marginBottom: 10 }}>
                            <div>🏥 {sos.hospital} • 📍 {sos.district}</div>
                            <div>💉 {sos.units} unit(s) needed</div>
                        </div>

                        {!isOwn && (
                            <button
                                onClick={() => handleRespond(sos._id)}
                                disabled={hasResponded}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: hasResponded
                                        ? '#d4edda'
                                        : 'linear-gradient(135deg, #28a745, #20c997)',
                                    color: hasResponded ? '#155724' : 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    fontSize: '0.85em',
                                    cursor: hasResponded ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {hasResponded ? '✅ You Responded' : '🤝 I Can Help'}
                            </button>
                        )}
                    </div>
                );
            })}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default SOSActiveList;
