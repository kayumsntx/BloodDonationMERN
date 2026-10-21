const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const GeneralReport = require('../models/GeneralReport');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ========== POST /api/reports ==========
// Protected: Logged-in user reports an article
router.post('/', protect, async (req, res) => {
    try {
        const { postId, reason } = req.body;

        if (!postId || !reason || !reason.trim()) {
            return res.status(400).json({ message: 'Post ID and a valid reason are required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'The article you are trying to report does not exist' });
        }

        const report = await Report.create({
            user: req.user._id,
            post: postId,
            reason: reason.trim()
        });

        res.status(201).json({
            message: 'Report submitted successfully. Our moderation team will review this article shortly.',
            report
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== POST /api/reports/general ==========
// Public / Protected: General report or issue contact
router.post('/general', async (req, res) => {
    try {
        const { subject, category, description, name, email } = req.body;

        if (!subject || !category || !description) {
            return res.status(400).json({ message: 'Subject, category, and description are required' });
        }

        const validCategories = ['technical_issue', 'fake_profile', 'spam', 'feedback', 'other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }

        let userId = null;
        let submitterName = name || 'Anonymous';
        let submitterEmail = email || '';

        // If authorization header present, extract user
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user) {
                    userId = user._id;
                    submitterName = user.name;
                    submitterEmail = user.email;
                }
            } catch (err) {
                // Token invalid or expired, continue as anonymous
            }
        }

        const generalReport = await GeneralReport.create({
            user: userId,
            name: submitterName,
            email: submitterEmail,
            subject: subject.trim(),
            category,
            description: description.trim()
        });

        res.status(201).json({
            message: 'Thank you! Your report has been submitted to the administration team.',
            report: generalReport
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
