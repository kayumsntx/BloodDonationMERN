import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔥 Error Boundary caught:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
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
                        padding: '40px 30px',
                        maxWidth: 500,
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ fontSize: '4em', marginBottom: 15 }}>⚠️</div>
                        <h1 style={{ color: '#dc3545', marginBottom: 10, fontSize: '1.5em' }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: '#666', marginBottom: 25, lineHeight: 1.6 }}>
                            An unexpected error occurred. Please try refreshing the page
                            or go back to the dashboard.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                background: '#f8f9fa',
                                padding: 15,
                                borderRadius: 8,
                                marginBottom: 20,
                                textAlign: 'left',
                                fontSize: '0.8em',
                                color: '#666'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                                    Error Details (Dev Only)
                                </summary>
                                <pre style={{
                                    marginTop: 10,
                                    overflow: 'auto',
                                    maxHeight: 200
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={this.handleReload}
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
                                🔄 Reload
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                🏠 Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
