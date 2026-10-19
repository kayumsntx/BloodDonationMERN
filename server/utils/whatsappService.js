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
            client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        } catch (e) {
            console.error('Twilio WhatsApp init failed:', e.message);
        }
    }
    return client;
}

async function sendWhatsApp(to, message) {
    const twilioClient = getClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
    if (!twilioClient || !fromNumber) {
        return { success: false, error: 'Twilio WhatsApp not configured' };
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
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${formattedTo}`
        });

        console.log(`💚 WhatsApp message sent to ${formattedTo}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('WhatsApp error:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendWhatsAppSOS(to, data) {
    const url = process.env.CLIENT_URL || '';
    const message = `🚨 *EMERGENCY BLOOD NEEDED*\n\n🩸 Blood Group: ${data.bloodGroup}\n🏥 Hospital: ${data.hospital}\n📍 District: ${data.district}\n💉 Units: ${data.units || 1}\n\nOpen app to help: ${url}/dashboard`;
    return sendWhatsApp(to, message);
}

module.exports = { sendWhatsApp, sendWhatsAppSOS };
