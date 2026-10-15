const nodemailer = require('nodemailer');

// Email Transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generic Email Sender
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log('⚠️ Email credentials not configured yet. Skipping sending email to:', to);
            return { success: false, message: 'Email credentials not configured' };
        }
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: `"Blood Donation" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
};

// Password Reset Email
const sendPasswordResetEmail = async (email, resetUrl, name) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #dc3545;">🩸 Blood Donation</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>You requested to reset your password. Click the button below to reset:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 0.9em;">If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 0.8em; text-align: center;">© 2026 Blood Donation Platform. All rights reserved.</p>
        </div>
    `;
    return sendEmail({
        to: email,
        subject: 'Password Reset Request - Blood Donation',
        html
    });
};

// Email Verification
const sendVerificationEmail = async (email, verifyUrl, name) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc3545; text-align: center;">🩸 Welcome to Blood Donation</h1>
            <h2>Hi ${name},</h2>
            <p>Thanks for signing up! Please verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link expires in 24 hours.</p>
        </div>
    `;
    return sendEmail({
        to: email,
        subject: 'Verify Your Email - Blood Donation',
        html
    });
};

// Emergency Alert
const sendEmergencyAlert = async (email, requestData, donorName) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1>🚨 EMERGENCY BLOOD REQUEST</h1>
            </div>
            <div style="padding: 20px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
                <h2>Hi ${donorName},</h2>
                <p>An emergency blood request matches your blood group:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                    <p><strong>🩸 Blood Group:</strong> ${requestData.bloodGroup}</p>
                    <p><strong>🏥 Hospital:</strong> ${requestData.hospital}</p>
                    <p><strong>📍 District:</strong> ${requestData.district}</p>
                    <p><strong>💉 Units:</strong> ${requestData.quantity}</p>
                    <p><strong>⏰ Urgency:</strong> ${requestData.urgency}</p>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/feed" style="display: inline-block; padding: 14px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Request</a>
                </div>
            </div>
        </div>
    `;
    return sendEmail({
        to: email,
        subject: '🚨 EMERGENCY: Blood Needed - Can You Help?',
        html
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendEmergencyAlert
};
