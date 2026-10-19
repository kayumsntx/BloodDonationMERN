import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SOSModal = ({ onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Confirm, 2: Details, 3: Sending, 4: Done
    const [formData, setFormData] = useState({
        bloodGroup: user?.bloodGroup || 'O+',
        patientName: user?.name || '',
        hospital: '',
        district: user?.district || '',
        address: '',
        contactNumber: user?.phoneNumber || '',
        units: 1,
        message: 'Emergency! Blood needed urgently!'
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendSOS = async () => {
        if (!formData.hospital || !formData.district || !formData.contactNumber) {
            toast.error('Please fill hospital, district, and contact number');
            return;
        }

        setStep(3);

        try {
            const { data } = await api.post('/sos', formData);
            setResult(data);
            setStep(4);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send SOS');
            setStep(2);
        }
    };

    const handleBackdropClick = (e) => {
        // Only close if clicking directly on the backdrop on step 1 (before form entry) or step 4 (after done)
        if (e.target === e.currentTarget && (step === 1 || step === 4)) {
            onClose();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
                padding: 20
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: 20,
                    maxWidth: 480,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '30px',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {step !== 3 && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            position: 'absolute',
                            top: 15,
                            right: 15,
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            cursor: 'pointer',
                            fontSize: '1.1em',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                    >
                        ✕
                    </button>
                )}
                {/* Step 1: Confirmation */}
                {step === 1 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: '4em', marginBottom: 10 }}>🚨</div>
                            <h2 style={{ color: '#c0392b', marginBottom: 10 }}>
                                Emergency SOS
                            </h2>
                            <p style={{ color: '#666', lineHeight: 1.6 }}>
                                This will send an <strong style={{ color: '#c0392b' }}>
                                    emergency alert
                                </strong> to all matching blood donors near you.
                            </p>
                        </div>

                        <div style={{
                            background: '#fff3cd',
                            border: '2px solid #ffc107',
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 20,
                            fontSize: '0.85em',
                            color: '#856404'
                        }}>
                            ⚠️ <strong>Important:</strong>
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                <li>Use only in real emergency</li>
                                <li>All matching donors will be notified instantly</li>
                                <li>Emails will be sent to eligible donors</li>
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1em',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    flex: 2,
                                    padding: 12,
                                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1em',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                🚨 Continue
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Form */}
                {step === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSendSOS(); }}>
                        <div style={{ textAlign: 'center', marginBottom: 15 }}>
                            <div style={{ fontSize: '2.5em', marginBottom: 5 }}>📝</div>
                            <h3 style={{ color: '#2c3e50', marginBottom: 5 }}>
                                Emergency Details
                            </h3>
                            <p style={{ fontSize: '0.85em', color: '#666' }}>
                                Fill in the necessary information
                            </p>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                Blood Group Needed *
                            </label>
                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            >
                                {BLOOD_GROUPS.map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                Patient Name
                            </label>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                placeholder="Patient's name"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                Hospital *
                            </label>
                            <input
                                type="text"
                                name="hospital"
                                value={formData.hospital}
                                onChange={handleChange}
                                placeholder="Hospital name"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                District / City *
                            </label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="District"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Your phone number"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 5 }}>
                                Units Needed
                            </label>
                            <input
                                type="number"
                                name="units"
                                value={formData.units}
                                onChange={handleChange}
                                min="1"
                                max="10"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: 8,
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1em',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 2,
                                    padding: 12,
                                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1em',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                🚨 Send SOS Now
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Sending */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '4em', marginBottom: 15, animation: 'pulse 1.5s infinite' }}>
                            🚨
                        </div>
                        <h2 style={{ color: '#c0392b', marginBottom: 10 }}>
                            Sending SOS Alert...
                        </h2>
                        <p style={{ color: '#666', marginBottom: 20 }}>
                            Notifying all matching donors
                        </p>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { transform: scale(1); opacity: 1; }
                                50% { transform: scale(1.2); opacity: 0.7; }
                            }
                        `}</style>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && result && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '4em', marginBottom: 10 }}>✅</div>
                        <h2 style={{ color: '#28a745', marginBottom: 10 }}>
                            SOS Alert Sent!
                        </h2>
                        <p style={{ color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
                            <strong style={{ color: '#c0392b', fontSize: '1.2em' }}>
                                {result.notifiedCount} donors
                            </strong> have been notified
                            about your emergency.
                        </p>

                        <div style={{
                            background: '#d4edda',
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 20,
                            fontSize: '0.9em',
                            color: '#155724',
                            textAlign: 'left'
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                🩸 What happens next?
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Donors will see your alert instantly</li>
                                <li>You'll get a notification when someone responds</li>
                                <li>Check your phone and be ready to answer</li>
                            </ul>
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: 14,
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: '1em',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            OK, Got It
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SOSModal;
