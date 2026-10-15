import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Certificate = ({ donation, onClose }) => {
    const { user } = useAuth();
    const certRef = useRef(null);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownload = () => {
        // Use browser's print to PDF feature
        window.print();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: 20
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: 15,
                    maxWidth: 700,
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Certificate Body */}
                <div
                    ref={certRef}
                    id="certificate-content"
                    style={{
                        background: 'linear-gradient(135deg, #fff8f8 0%, #fce4ec 100%)',
                        padding: '50px 40px',
                        textAlign: 'center',
                        border: '8px double #dc3545',
                        borderRadius: 10,
                        margin: 20,
                        position: 'relative'
                    }}
                >
                    {/* Corner Decorations */}
                    <div style={{
                        position: 'absolute', top: 15, left: 15,
                        fontSize: '1.5em', color: '#dc3545'
                    }}>🩸</div>
                    <div style={{
                        position: 'absolute', top: 15, right: 15,
                        fontSize: '1.5em', color: '#dc3545'
                    }}>🩸</div>
                    <div style={{
                        position: 'absolute', bottom: 15, left: 15,
                        fontSize: '1.5em', color: '#dc3545'
                    }}>🩸</div>
                    <div style={{
                        position: 'absolute', bottom: 15, right: 15,
                        fontSize: '1.5em', color: '#dc3545'
                    }}>🩸</div>

                    <div style={{ fontSize: '3em', marginBottom: 10 }}>🏆</div>

                    <h1 style={{
                        color: '#dc3545',
                        fontSize: '1.8em',
                        letterSpacing: 2,
                        marginBottom: 5
                    }}>
                        CERTIFICATE OF APPRECIATION
                    </h1>

                    <div style={{
                        width: 80, height: 3,
                        background: '#dc3545',
                        margin: '15px auto'
                    }} />

                    <p style={{
                        fontSize: '0.95em',
                        color: '#666',
                        fontStyle: 'italic',
                        marginBottom: 25
                    }}>
                        This certificate is proudly presented to
                    </p>

                    <h2 style={{
                        color: '#2c3e50',
                        fontSize: '2em',
                        marginBottom: 10,
                        borderBottom: '2px solid #dc3545',
                        paddingBottom: 10,
                        display: 'inline-block'
                    }}>
                        {donation.donor?.name || user?.name}
                    </h2>

                    <p style={{
                        fontSize: '0.95em',
                        color: '#555',
                        lineHeight: 1.8,
                        maxWidth: 500,
                        margin: '20px auto'
                    }}>
                        For the selfless act of donating <strong style={{ color: '#dc3545' }}>
                            {donation.units || 1} unit(s) of {donation.bloodGroup} blood
                        </strong> at <strong>{donation.hospital}</strong>, {donation.district}.
                        Your generosity has helped save precious lives and inspired others.
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: 30,
                        paddingTop: 20,
                        borderTop: '1px solid #ccc',
                        flexWrap: 'wrap',
                        gap: 15
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75em', color: '#888' }}>DATE</div>
                            <div style={{ fontWeight: 600 }}>{formatDate(donation.donatedAt)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75em', color: '#888' }}>CERTIFICATE ID</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9em' }}>
                                {donation.certificateId || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75em', color: '#888' }}>BLOOD GROUP</div>
                            <div style={{ fontWeight: 600, color: '#dc3545' }}>
                                {donation.bloodGroup}
                            </div>
                        </div>
                    </div>

                    <p style={{
                        marginTop: 30,
                        fontSize: '0.75em',
                        color: '#888',
                        fontStyle: 'italic'
                    }}>
                        "Every drop counts. Thank you for being a hero."
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: 10,
                    padding: '0 20px 20px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: '#f0f0f0',
                            color: '#333',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        📥 Download / Print
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #certificate-content, #certificate-content * { visibility: visible; }
                    #certificate-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: 4px solid #dc3545;
                        margin: 0;
                        border-radius: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Certificate;
