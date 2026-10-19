import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ITEMS = [
    { key: 'push', icon: '📱', label: 'Push Notifications', desc: 'Browser alerts for matches and SOS' },
    { key: 'email', icon: '📧', label: 'Email Notifications', desc: 'Important updates via email' },
    { key: 'sms', icon: '💬', label: 'SMS Alerts', desc: 'Text messages for emergencies' },
    { key: 'whatsapp', icon: '💚', label: 'WhatsApp Alerts', desc: 'WhatsApp for SOS and matches' },
    { key: 'digest', icon: '📰', label: 'Weekly Digest', desc: 'Summary of activity every week' },
    { key: 'marketing', icon: '📢', label: 'Promotions', desc: 'News and feature updates' }
];

const NotificationSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const { data } = await api.get('/users/notification-settings');
            setSettings(data || {});
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggle = async (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        try {
            await api.put('/users/notification-settings', { [key]: newValue });
            toast.success(`${key.toUpperCase()} alert: ${newValue ? 'ON' : 'OFF'}`);
        } catch (error) {
            toast.error('Failed to save preference');
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading notification preferences...</div>;

    return (
        <div>
            <h3 style={{ marginBottom: 15, color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>
                🔔 Notification Preferences
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
                Control how and when you receive emergency alerts, matches, and community updates.
            </p>
            {ITEMS.map(item => (
                <div key={item.key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'white',
                    borderRadius: 12,
                    marginBottom: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <span style={{ fontSize: '1.6em' }}>{item.icon}</span>
                        <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                            <div style={{ fontSize: '0.82em', color: '#64748b' }}>{item.desc}</div>
                        </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 26, margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={!!settings[item.key]}
                            onChange={() => toggle(item.key)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            inset: 0,
                            background: settings[item.key] ? '#10b981' : '#cbd5e1',
                            borderRadius: 26,
                            transition: '0.3s'
                        }}>
                            <span style={{
                                position: 'absolute',
                                content: '',
                                height: 20,
                                width: 20,
                                left: settings[item.key] ? 26 : 3,
                                bottom: 3,
                                background: 'white',
                                borderRadius: '50%',
                                transition: '0.3s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </span>
                    </label>
                </div>
            ))}
        </div>
    );
};

export default NotificationSettings;
