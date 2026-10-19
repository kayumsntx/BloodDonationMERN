const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Auto-create and list blood group groups
router.get('/blood-groups', protect, async (req, res) => {
    try {
        const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        
        for (const bg of BLOOD_GROUPS) {
            let group = await Group.findOne({ type: 'bloodGroup', bloodGroup: bg });
            if (!group) {
                await Group.create({
                    name: `${bg} Blood Group`,
                    type: 'bloodGroup',
                    bloodGroup: bg,
                    icon: '🩸',
                    description: `Community for ${bg} blood type donors`
                });
            }
        }

        const user = await User.findById(req.user._id);
        const groups = await Group.find({
            type: 'bloodGroup'
        }).select('name bloodGroup icon description members');

        const withMemberCount = groups.map(g => {
            const memberIds = (g.members || []).map(m => m.toString());
            return {
                _id: g._id,
                name: g.name,
                bloodGroup: g.bloodGroup,
                icon: g.icon,
                description: g.description,
                memberCount: memberIds.length,
                isMember: memberIds.includes(req.user._id.toString()),
                isRecommended: g.bloodGroup === user?.bloodGroup
            };
        });

        res.json(withMemberCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/join', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        
        const exists = group.members.some(m => m.toString() === req.user._id.toString());
        if (!exists) {
            group.members.push(req.user._id);
            await group.save();
        }
        res.json({ message: 'Joined group', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/messages', protect, async (req, res) => {
    try {
        const messages = await GroupMessage.find({ group: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name profilePic')
            .lean();
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
