const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const GeneralReport = require('../models/GeneralReport');
const { protect, authorizeRoles } = require('../middleware/auth');

// ==========================================
// 1. USER MANAGEMENT APIS
// ==========================================

// GET /api/admin/users
// Protected: Only 'super_admin' and 'admin'
router.get('/users', protect, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/users/:id/role
// Protected: STRICTLY ONLY 'super_admin'
router.put('/users/:id/role', protect, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` 
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `Role for ${user.name} updated to ${role} successfully.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/users/:id/status
// Protected: Both 'super_admin' and 'admin'
router.put('/users/:id/status', protect, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { status, reason } = req.body;
        const validStatuses = ['active', 'suspended', 'banned'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent non-super_admin from modifying super_admin
        if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Cannot modify status of a Super Admin.' });
        }

        user.status = status;
        user.isBlocked = (status === 'banned' || status === 'suspended');
        if (reason) {
            user.blockedReason = reason;
        }

        await user.save();

        res.json({
            message: `User ${user.name} is now ${status}.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 2. POST / ARTICLE MANAGEMENT APIS
// ==========================================

// GET /api/admin/posts
// Protected: 'super_admin', 'admin', 'moderator'
router.get('/posts', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ['pending', 'published', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .populate('author', 'name email profilePic role bloodGroup district')
            .populate('approvedBy', 'name role');

        // Calculate count by status for dashboard summary tabs
        const [pendingCount, publishedCount, rejectedCount] = await Promise.all([
            Post.countDocuments({ status: 'pending' }),
            Post.countDocuments({ status: 'published' }),
            Post.countDocuments({ status: 'rejected' })
        ]);

        res.json({
            posts,
            counts: {
                pending: pendingCount,
                published: publishedCount,
                rejected: rejectedCount,
                total: pendingCount + publishedCount + rejectedCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/posts/:id/approve
// Protected: 'super_admin', 'admin', 'moderator'
router.put('/posts/:id/approve', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        post.status = 'published';
        post.approvedBy = req.user._id;
        post.approvedAt = new Date();
        post.rejectionReason = '';

        await post.save();
        await post.populate('author', 'name email role');

        res.json({ message: 'Article approved and published! ✅', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/posts/:id/reject
// Protected: 'super_admin', 'admin', 'moderator'
router.put('/posts/:id/reject', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { reason } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        post.status = 'rejected';
        post.rejectionReason = reason || 'Does not adhere to editorial quality or health guidelines.';
        await post.save();

        res.json({ message: 'Article rejected. ❌', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/admin/posts/:id
// Protected: 'super_admin', 'admin', 'moderator'
router.delete('/posts/:id', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        await Post.findByIdAndDelete(req.params.id);
        // Also remove any reports linked to this post
        await Report.deleteMany({ post: req.params.id });

        res.json({ message: 'Article permanently deleted. 🗑️' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 3. ARTICLE REPORTS APIS
// ==========================================

// GET /api/admin/reports
// Protected: 'super_admin', 'admin', 'moderator'
router.get('/reports', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const reports = await Report.find(filter)
            .sort({ createdAt: -1 })
            .populate('user', 'name email profilePic role')
            .populate('post', 'title status author isDoctorPost category coverImage')
            .populate('reviewedBy', 'name role');

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/reports/:id/resolve
// Protected: 'super_admin', 'admin', 'moderator'
router.put('/reports/:id/resolve', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = 'reviewed';
        report.reviewedBy = req.user._id;
        report.reviewedAt = new Date();
        await report.save();

        res.json({ message: 'Report marked as reviewed.', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 4. GENERAL PLATFORM REPORTS APIS
// ==========================================

// GET /api/admin/reports/general
// Protected: 'super_admin', 'admin', 'moderator'
router.get('/reports/general', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const reports = await GeneralReport.find(filter)
            .sort({ createdAt: -1 })
            .populate('user', 'name email profilePic role')
            .populate('resolvedBy', 'name role');

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/reports/general/:id
// Protected: 'super_admin', 'admin', 'moderator'
router.put('/reports/general/:id', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const validStatuses = ['pending', 'in_progress', 'resolved'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const report = await GeneralReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'General report not found' });
        }

        report.status = status;
        if (adminNotes !== undefined) report.adminNotes = adminNotes;
        if (status === 'resolved') {
            report.resolvedBy = req.user._id;
            report.resolvedAt = new Date();
        }

        await report.save();

        res.json({
            message: `Report status updated to ${status}.`,
            report
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
