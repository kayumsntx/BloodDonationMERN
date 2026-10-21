const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

// ========== GET /api/posts ==========
// Public: Get all published articles with category, search, and sort filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort = 'recent', tag } = req.query;

        const filter = { status: 'published' };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (tag) {
            filter.tags = tag;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'rating') {
            sortOption = { averageRating: -1, ratingCount: -1 };
        } else if (sort === 'popular') {
            sortOption = { views: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const posts = await Post.find(filter)
            .sort(sortOption)
            .populate('author', 'name email profilePic role bloodGroup district badge')
            .populate('approvedBy', 'name role');

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== GET /api/posts/dashboard/pending ==========
// Protected: allowedRoles('super_admin', 'admin', 'moderator')
router.get('/dashboard/pending', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const pendingPosts = await Post.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate('author', 'name email profilePic role bloodGroup district');

        res.json(pendingPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== GET /api/posts/dashboard/all ==========
// Protected: allowedRoles('super_admin', 'admin', 'moderator')
router.get('/dashboard/all', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .populate('author', 'name email profilePic role bloodGroup district')
            .populate('approvedBy', 'name role');

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== GET /api/posts/my-posts ==========
// Protected: Logged-in user's articles
router.get('/my-posts', protect, async (req, res) => {
    try {
        const myPosts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 });

        res.json(myPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== GET /api/posts/:id ==========
// Public: Get single post details and increment views
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email profilePic role bloodGroup district badge')
            .populate('approvedBy', 'name role')
            .populate('comments.user', 'name profilePic role');

        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Increment views
        post.views += 1;
        await post.save({ validateBeforeSave: false });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== POST /api/posts ==========
// Protected: Logged-in users can submit articles
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, coverImage } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const userRole = req.user.role || 'user';
        const isDoctor = userRole === 'doctor';
        const isAdminOrSuper = ['super_admin', 'admin'].includes(userRole);

        // Doctor articles receive high credibility tag
        let credibilityBadge = '';
        if (isDoctor) {
            credibilityBadge = '🩺 Verified Medical Advice';
        }

        // Admins/Super Admins publish immediately; others default to 'pending'
        const status = isAdminOrSuper ? 'published' : 'pending';

        const parsedTags = Array.isArray(tags)
            ? tags
            : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

        const post = await Post.create({
            title: title.trim(),
            content,
            excerpt: excerpt ? excerpt.trim() : content.substring(0, 180) + '...',
            category: category || 'Blood Donation',
            tags: parsedTags,
            coverImage: coverImage || '',
            author: req.user._id,
            authorRole: userRole,
            isDoctorPost: isDoctor,
            credibilityBadge,
            status,
            ...(isAdminOrSuper ? { approvedBy: req.user._id, approvedAt: new Date() } : {})
        });

        await post.populate('author', 'name email profilePic role bloodGroup');

        res.status(201).json({
            message: status === 'published'
                ? 'Article published directly!'
                : 'Article submitted successfully! Awaiting moderator review.',
            post
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== PUT /api/posts/dashboard/approve/:id ==========
// Protected: allowedRoles('super_admin', 'admin', 'moderator')
router.put('/dashboard/approve/:id', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
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
        await post.populate('author', 'name email profilePic role');

        res.json({ message: 'Article approved and published!', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== PUT /api/posts/dashboard/reject/:id ==========
// Protected: allowedRoles('super_admin', 'admin', 'moderator')
router.put('/dashboard/reject/:id', protect, authorizeRoles('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { reason } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        post.status = 'rejected';
        post.rejectionReason = reason || 'Does not meet our content guidelines.';
        await post.save();

        res.json({ message: 'Article rejected', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== POST /api/posts/:id/comment ==========
// Protected: Logged-in users can comment
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment text cannot be empty' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const newComment = {
            user: req.user._id,
            name: req.user.name,
            profilePic: req.user.profilePic || '',
            role: req.user.role || 'user',
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            message: 'Comment posted successfully',
            comment: post.comments[post.comments.length - 1]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== POST /api/posts/:id/rate ==========
// Protected: Logged-in users can rate (1 to 5 stars)
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const rating = Number(req.body.rating);
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const existingRatingIndex = post.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingRatingIndex >= 0) {
            post.ratings[existingRatingIndex].rating = rating;
            post.ratings[existingRatingIndex].createdAt = new Date();
        } else {
            post.ratings.push({
                user: req.user._id,
                rating,
                createdAt: new Date()
            });
        }

        // Recalculate average rating
        const sum = post.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        post.ratingCount = post.ratings.length;
        post.averageRating = Number((sum / post.ratingCount).toFixed(1));

        await post.save();

        res.json({
            message: 'Rating submitted successfully!',
            averageRating: post.averageRating,
            ratingCount: post.ratingCount,
            userRating: rating
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== DELETE /api/posts/:id ==========
// Protected: Author or super_admin / admin can delete
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const isAuthor = post.author.toString() === req.user._id.toString();
        const isSuperOrAdmin = ['super_admin', 'admin'].includes(req.user.role);

        if (!isAuthor && !isSuperOrAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this article' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== PUT /api/posts/admin/user-role/:userId ==========
// Protected: super_admin has full control over user roles
router.put('/admin/user-role/:userId', protect, authorizeRoles('super_admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['super_admin', 'admin', 'moderator', 'doctor', 'special_member', 'user'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `User ${user.name}'s role updated to ${role} successfully`,
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

module.exports = router;
