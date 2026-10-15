import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <BrowserRouter>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: { background: '#363636', color: '#fff' }
                        }}
                    />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/verify-email/:token" element={<VerifyEmail />} />
                        <Route path="/dashboard/*" element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </BrowserRouter>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
