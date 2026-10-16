// ========== Blood Donation Eligibility Rules ==========
// Minimum gap between donations = 90 days (3 months)
const MIN_DAYS_BETWEEN_DONATIONS = 90;

// Minimum age to donate
const MIN_AGE = 18;
const MAX_AGE = 65;

/**
 * Check if a user is eligible to donate blood
 * @param {Object} user - User document
 * @returns {Object} - { eligible: boolean, reason: string, nextEligibleDate: Date, daysRemaining: number }
 */
function checkEligibility(user) {
    // 1. Check age
    if (user.age < MIN_AGE) {
        return {
            eligible: false,
            reason: `Must be at least ${MIN_AGE} years old`,
            nextEligibleDate: null,
            daysRemaining: 0
        };
    }

    if (user.age > MAX_AGE) {
        return {
            eligible: false,
            reason: `Age limit is ${MAX_AGE} years`,
            nextEligibleDate: null,
            daysRemaining: 0
        };
    }

    // 2. Check last donation date (90-day rule)
    if (user.lastDonationDate) {
        const lastDonation = new Date(user.lastDonationDate);
        const today = new Date();
        const diffInMs = today - lastDonation;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const daysRemaining = MIN_DAYS_BETWEEN_DONATIONS - diffInDays;

        if (diffInDays < MIN_DAYS_BETWEEN_DONATIONS) {
            const nextEligible = new Date(lastDonation);
            nextEligible.setDate(nextEligible.getDate() + MIN_DAYS_BETWEEN_DONATIONS);

            return {
                eligible: false,
                reason: `Must wait ${daysRemaining} more day(s) since last donation`,
                nextEligibleDate: nextEligible,
                daysRemaining,
                lastDonationDate: lastDonation,
                totalDaysSince: diffInDays
            };
        }
    }

    // 3. Check donor availability toggle
    if (!user.isDonorAvailable) {
        return {
            eligible: false,
            reason: 'Donor availability is turned off',
            nextEligibleDate: null,
            daysRemaining: 0
        };
    }

    // Eligible!
    return {
        eligible: true,
        reason: 'Ready to donate',
        nextEligibleDate: null,
        daysRemaining: 0,
        lastDonationDate: user.lastDonationDate || null
    };
}

/**
 * Calculate next eligible date
 */
function calculateNextEligibleDate(lastDonationDate) {
    if (!lastDonationDate) return null;
    const next = new Date(lastDonationDate);
    next.setDate(next.getDate() + MIN_DAYS_BETWEEN_DONATIONS);
    return next;
}

/**
 * Days remaining until next donation
 */
function daysUntilEligible(lastDonationDate) {
    if (!lastDonationDate) return 0;
    const last = new Date(lastDonationDate);
    const today = new Date();
    const diffInDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    const remaining = MIN_DAYS_BETWEEN_DONATIONS - diffInDays;
    return remaining > 0 ? remaining : 0;
}

/**
 * Check if user can donate by a specific date
 */
function canDonateBy(user, targetDate) {
    if (!user.lastDonationDate) return true;
    const nextEligible = calculateNextEligibleDate(user.lastDonationDate);
    return targetDate >= nextEligible;
}

module.exports = {
    MIN_DAYS_BETWEEN_DONATIONS,
    MIN_AGE,
    MAX_AGE,
    checkEligibility,
    calculateNextEligibleDate,
    daysUntilEligible,
    canDonateBy
};
