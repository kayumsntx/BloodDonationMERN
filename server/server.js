const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// ========== Database ==========
connectDB();

// ========== Security Headers ==========
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

// ========== CORS ==========
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
}));

// ========== Body Parser ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========== Rate Limiting ==========
// Strict on auth, loose on everything else
app.use('/api/auth', rateLimiter(20, 15 * 60 * 1000)); // 20 requests / 15 min
app.use('/api', rateLimiter(500, 15 * 60 * 1000));     // 500 requests / 15 min

// ========== Store io in app ==========
app.set('io', io);

// ========== Routes ==========
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/messages', require('./routes/messages').router);
app.use('/api/donations', require('./routes/donations'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// ========== Health Check ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Blood Donation API is running',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ========== Root ==========
app.get('/', (req, res) => {
    res.send('🩸 Blood Donation API is running!');
});

// ========== Socket Handlers ==========
require('./socket/socketHandler')(io);

// ========== Error Handlers (MUST BE LAST) ==========
app.use(notFound);
app.use(errorHandler);

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('============================================');
    console.log(`🩸 Blood Donation Server`);
    console.log('============================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'Not specified'}`);
    console.log('============================================');
});

// ========== Handle Uncaught Errors ==========
process.on('unhandledRejection', (err) => {
    console.error('🔥 Unhandled Rejection:', err?.message || err);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err?.message || err);
    process.exit(1);
});