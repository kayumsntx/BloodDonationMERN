const baseStyle = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
`;

const headerStyle = `
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 25px;
    border-radius: 10px 10px 0 0;
    text-align: center;
`;

const bodyStyle = `
    background: white;
    padding: 30px;
    border-radius: 0 0 10px 10px;
`;

const buttonStyle = `
    display: inline-block;
    padding: 12px 30px;
    background: #dc3545;
    color: white !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    margin: 10px 0;
`;

const template = (title, content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#f8f9fa;">
    <div style="${baseStyle}">
        <div style="${headerStyle}">
            <h1 style="margin:0; font-size:1.5em;">🩸 Blood Donation</h1>
            <p style="margin:5px 0 0 0; opacity:0.9; font-size:0.9em;">${title}</p>
        </div>
        <div style="${bodyStyle}">
            ${content}
        </div>
        <div style="text-align:center; padding:20px; color:#999; font-size:0.8em;">
            <p>© 2026 Blood Donation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    passwordReset: (name, url) => template('Password Reset', `
        <h2>Hello ${name},</h2>
        <p>You requested to reset your password. Click below to continue:</p>
        <div style="text-align:center;"><a href="${url}" style="${buttonStyle}">Reset Password</a></div>
        <p style="color:#666; font-size:0.9em;">This link expires in 15 minutes.</p>
        <p style="color:#666; font-size:0.9em;">If you didn't request this, ignore this email.</p>
    `),
    
    emailVerification: (name, url) => template('Verify Email', `
        <h2>Welcome, ${name}! 🎉</h2>
        <p>Thanks for joining! Please verify your email:</p>
        <div style="text-align:center;"><a href="${url}" style="${buttonStyle}">Verify Email</a></div>
        <p style="color:#666; font-size:0.9em;">Expires in 24 hours.</p>
    `),
    
    sosAlert: (donorName, data) => template('🚨 Emergency Alert', `
        <h2>Hi ${donorName},</h2>
        <p style="color:#c0392b; font-weight:bold;">An EMERGENCY blood request matches your blood group!</p>
        <div style="background:#fff5f5; padding:20px; border-left:4px solid #dc3545; margin:20px 0;">
            <p><strong>🩸 Blood Group:</strong> ${data.bloodGroup}</p>
            <p><strong>🏥 Hospital:</strong> ${data.hospital}</p>
            <p><strong>📍 District:</strong> ${data.district}</p>
            <p><strong>💉 Units:</strong> ${data.quantity || data.units || 1}</p>
        </div>
        <div style="text-align:center;">
            <a href="${data.url || (process.env.CLIENT_URL ? process.env.CLIENT_URL + '/dashboard' : '#')}" style="${buttonStyle}">View Request</a>
        </div>
    `),
    
    badgeUnlocked: (name, badge) => template('🏆 Badge Unlocked!', `
        <h2>Congratulations, ${name}! 🎉</h2>
        <div style="text-align:center; font-size:4em; margin:20px 0;">${badge.icon}</div>
        <h3 style="text-align:center;">You earned the ${badge.name}!</h3>
        <p style="text-align:center; color:#666;">${badge.description}</p>
        <div style="text-align:center;">
            <a href="${process.env.CLIENT_URL || ''}/dashboard/profile" style="${buttonStyle}">View Achievement</a>
        </div>
    `),
    
    welcome: (name) => template('Welcome!', `
        <h2>Welcome, ${name}! 🩸</h2>
        <p>You're now part of a community saving lives.</p>
        <ul>
            <li>Complete your profile</li>
            <li>Turn on donor availability</li>
            <li>Browse blood requests</li>
        </ul>
        <div style="text-align:center;">
            <a href="${process.env.CLIENT_URL || ''}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
        </div>
    `)
};
