import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastConfig = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#fff',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    fontSize: '0.9em',
                    maxWidth: '400px'
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#28a745',
                        secondary: '#fff'
                    }
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#dc3545',
                        secondary: '#fff'
                    }
                }
            }}
        />
    );
};

export default ToastConfig;
