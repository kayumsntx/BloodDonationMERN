const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.jwtRole = decoded.role;
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.status === 'suspended' || req.user.status === 'banned' || req.user.isBlocked) {
                const statusMessage = req.user.status === 'suspended'
                    ? 'Your account has been temporarily suspended by an administrator.'
                    : 'Your account has been banned from the platform.';
                return res.status(403).json({ 
                    message: statusMessage,
                    status: req.user.status || 'banned',
                    reason: req.user.blockedReason || ''
                });
            }

            return next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Flexible Role-Based Access Control Middleware (RBAC)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Checks role from JWT payload or loaded user document
        const role = req.jwtRole || req.user?.role;
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                message: `Access denied. Role (${role || 'None'}) is not authorized to access this route.`
            });
        }
        next();
    };
};

// Admin only (super_admin or admin)
const adminOnly = (req, res, next) => {
    const role = req.jwtRole || req.user?.role;
    if (role && (role === 'admin' || role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access only' });
    }
};

// Moderator, Admin, or Super Admin
const moderatorOnly = (req, res, next) => {
    const role = req.jwtRole || req.user?.role;
    if (role && ['super_admin', 'admin', 'moderator'].includes(role)) {
        next();
    } else {
        res.status(403).json({ message: 'Moderator access only' });
    }
};

module.exports = { protect, authorizeRoles, adminOnly, moderatorOnly };