import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            toast.success(`Welcome back, ${data.name}! 👋`);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            toast.success('Account created! 🎉 Check your email to verify.');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    // 🆕 Forgot Password
    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            toast.success(data.message || 'Reset email sent!');
            return { success: true, message: data.message };
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send email';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    // 🆕 Reset Password
    const resetPassword = async (token, password) => {
        try {
            const { data } = await api.put(`/auth/reset-password/${token}`, { password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            toast.success('Password reset successful! 🎉');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Reset failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    // 🆕 Verify Email
    const verifyEmail = async (token) => {
        try {
            const { data } = await api.get(`/auth/verify-email/${token}`);
            toast.success(data.message || 'Email verified!');
            return { success: true, message: data.message };
        } catch (error) {
            const msg = error.response?.data?.message || 'Verification failed';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    // 🆕 Resend Verification Email
    const resendVerification = async () => {
        try {
            const { data } = await api.post('/auth/resend-verification');
            toast.success(data.message || 'Verification email sent!');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    const value = {
        user, loading,
        login, register, logout, updateUser,
        forgotPassword, resetPassword, verifyEmail, resendVerification
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
