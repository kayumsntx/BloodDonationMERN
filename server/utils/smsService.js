let twilio = null;
try {
    twilio = require('twilio');
} catch (e) {
    console.log('twilio package not loaded yet');
}

let client = null;

function getClient() {
    if (!client && twilio && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
            client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        } catch (e) {
            console.error('Twilio initialization failed:', e.message);
        }
    }
    return client;
}

async function sendSMS(to, message) {
    const twilioClient = getClient();
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.log('Twilio not fully configured, skipping SMS');
        return { success: false, error: 'Not configured' };
    }

    try {
        let formattedTo = String(to).trim();
        if (!formattedTo.startsWith('+')) {
            formattedTo = formattedTo.startsWith('0') 
                ? `+880${formattedTo.substring(1)}` 
                : `+880${formattedTo}`;
        }

        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedTo
        });

        console.log(`📱 SMS sent to ${formattedTo}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('SMS error:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendSOSAlert(to, data) {
    const message = `🚨 EMERGENCY: ${data.bloodGroup} blood needed at ${data.hospital}, ${data.district}. ${data.units || 1} unit(s). Reply or open app to help. - Blood Donation`;
    return sendSMS(to, message);
}

async function sendMatchAlert(to, donorName, requesterName) {
    const url = process.env.CLIENT_URL || '';
    const message = `🩸 Hi ${donorName}, a blood match found: ${requesterName} needs help. Open app: ${url}/dashboard - Blood Donation`;
    return sendSMS(to, message);
}

module.exports = { sendSMS, sendSOSAlert, sendMatchAlert };
