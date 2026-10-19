// ========== Badge Definitions ==========
const BADGES = {
    None: {
        name: 'New Donor',
        icon: '🩸',
        color: '#95a5a6',
        minDonations: 0,
        description: 'Welcome to the blood donation community'
    },
    Bronze: {
        name: 'Bronze Donor',
        icon: '🥉',
        color: '#cd7f32',
        minDonations: 1,
        description: 'First donation - you saved up to 3 lives!'
    },
    Silver: {
        name: 'Silver Donor',
        icon: '🥈',
        color: '#c0c0c0',
        minDonations: 4,
        description: '4 donations - you are a regular hero'
    },
    Gold: {
        name: 'Gold Donor',
        icon: '🥇',
        color: '#ffd700',
        minDonations: 10,
        description: '10 donations - you are a life saver'
    },
    Platinum: {
        name: 'Platinum Donor',
        icon: '💎',
        color: '#e5e4e2',
        minDonations: 25,
        description: '25+ donations - legendary status achieved!'
    }
};

// ========== Milestones ==========
const MILESTONES = [
    { count: 1, badge: 'Bronze', icon: '🥉', title: 'First Drop', message: 'You saved your first life! 🎉' },
    { count: 4, badge: 'Silver', icon: '🥈', title: 'Regular Hero', message: 'You are officially a regular donor!' },
    { count: 10, badge: 'Gold', icon: '🥇', title: 'Life Saver', message: '10 donations - 30 lives saved!' },
    { count: 25, badge: 'Platinum', icon: '💎', title: 'Legendary', message: 'You are a living legend! 75+ lives saved.' },
    { count: 50, badge: 'Platinum', icon: '👑', title: 'Ultra Hero', message: '50 donations - you deserve a crown!' },
    { count: 100, badge: 'Platinum', icon: '🌟', title: 'Centurion', message: '100 donations - you are immortal!' }
];

// ========== Get Badge By Donation Count ==========
function getBadgeByCount(count) {
    if (count >= 25) return 'Platinum';
    if (count >= 10) return 'Gold';
    if (count >= 4) return 'Silver';
    if (count >= 1) return 'Bronze';
    return 'None';
}

// ========== Get Badge Info ==========
function getBadgeInfo(badgeName) {
    return BADGES[badgeName] || BADGES.None;
}

// ========== Get Next Milestone ==========
function getNextMilestone(currentCount) {
    for (const milestone of MILESTONES) {
        if (milestone.count > currentCount) {
            return milestone;
        }
    }
    return null; // Max reached
}

// ========== Get Progress to Next Badge ==========
function getProgressToNextBadge(currentCount) {
    const nextMilestone = getNextMilestone(currentCount);
    
    if (!nextMilestone) {
        return {
            nextBadge: null,
            current: currentCount,
            target: currentCount,
            progress: 100,
            remaining: 0
        };
    }

    // Find previous milestone
    let previousCount = 0;
    for (const m of MILESTONES) {
        if (m.count < nextMilestone.count) {
            previousCount = m.count;
        } else {
            break;
        }
    }

    const progress = Math.min(
        ((currentCount - previousCount) / (nextMilestone.count - previousCount)) * 100,
        100
    );

    return {
        nextBadge: nextMilestone.badge,
        nextMilestone: nextMilestone,
        current: currentCount,
        target: nextMilestone.count,
        progress: Math.round(progress),
        remaining: nextMilestone.count - currentCount
    };
}

// ========== Check if Count Reaches Milestone ==========
function checkMilestone(count) {
    return MILESTONES.find(m => m.count === count) || null;
}

// ========== Get All Badges for Display ==========
function getAllBadgesWithStatus(userDonations) {
    return Object.keys(BADGES).map(key => {
        const badge = BADGES[key];
        const unlocked = userDonations >= badge.minDonations;
        return {
            ...badge,
            name: badge.name,
            key: key,
            unlocked,
            minDonations: badge.minDonations
        };
    });
}

module.exports = {
    BADGES,
    MILESTONES,
    getBadgeByCount,
    getBadgeInfo,
    getNextMilestone,
    getProgressToNextBadge,
    checkMilestone,
    getAllBadgesWithStatus
};
