import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
    const location = useLocation();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
            padding: 20,
            fontFamily: 'Segoe UI, sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: 20,
                padding: '50px 30px',
                maxWidth: 500,
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }}>
                <div style={{
                    fontSize: '6em',
                    marginBottom: 10,
                    color: '#dc3545',
                    fontWeight: 900
                }}>
                    404
                </div>
                <h1 style={{ color: '#2c3e50', marginBottom: 10, fontSize: '1.5em' }}>
                    Page Not Found
                </h1>
                <p style={{ color: '#666', marginBottom: 8, lineHeight: 1.6 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <p style={{
                    color: '#999',
                    fontSize: '0.85em',
                    marginBottom: 25,
                    fontFamily: 'monospace'
                }}>
                    {location.pathname}
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                    <Link
                        to="/dashboard"
                        style={{
                            flex: 1,
                            padding: 12,
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: 10,
                            fontWeight: 700
                        }}
                    >
                        🏠 Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            flex: 1,
                            padding: 12,
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
