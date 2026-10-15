import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
