// Simple in-memory rate limiter (no external package needed)
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now - data.resetAt > 0) {
            requestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Number} maxRequests - Max requests allowed
 * @param {Number} windowMs - Time window in milliseconds
 */
function rateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        const key = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();

        let data = requestCounts.get(key);

        if (!data || now > data.resetAt) {
            data = { count: 0, resetAt: now + windowMs };
        }

        data.count += 1;
        requestCounts.set(key, data);

        // Set headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count));
        res.setHeader('X-RateLimit-Reset', new Date(data.resetAt).toISOString());

        if (data.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((data.resetAt - now) / 1000)
            });
        }

        next();
    };
}

module.exports = { rateLimiter };
