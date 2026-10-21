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

            // Durational Suspension & Ban Enforcement
            if (req.user.status === 'suspended') {
                // If suspension period has expired, automatically lift suspension
                if (req.user.suspendedUntil && new Date(req.user.suspendedUntil) <= new Date()) {
                    req.user.status = 'active';
                    req.user.suspendedUntil = null;
                    req.user.suspensionReason = '';
                    req.user.isBlocked = false;
                    await req.user.save({ validateBeforeSave: false });
                } else {
                    const untilDate = req.user.suspendedUntil;
                    const formattedUntil = untilDate
                        ? new Date(untilDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'further notice';
                    return res.status(403).json({
                        message: `Your account is temporarily suspended until ${formattedUntil}. Reason: ${req.user.suspensionReason || 'Administrative review'}`,
                        status: 'suspended',
                        suspendedUntil: req.user.suspendedUntil,
                        reason: req.user.suspensionReason || 'Administrative review'
                    });
                }
            }

            if (req.user.status === 'banned' || req.user.isBlocked) {
                return res.status(403).json({
                    message: `Your account has been permanently banned. Reason: ${req.user.banReason || req.user.blockedReason || 'Policy violation'}`,
                    status: 'banned',
                    reason: req.user.banReason || req.user.blockedReason || 'Policy violation'
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