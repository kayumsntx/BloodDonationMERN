import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ToastConfig from './components/Common/ToastConfig';
import NotFound from './components/Common/NotFound';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SocketProvider>
                    <BrowserRouter>
                        <ToastConfig />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/verify-email/:token" element={<VerifyEmail />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard/*" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />

                            {/* Redirects */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </SocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
