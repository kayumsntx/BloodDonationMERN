let admin = null;
try {
    admin = require('firebase-admin');
} catch (e) {
    console.log('firebase-admin package not loaded yet');
}

// Initialize Firebase Admin (once)
if (admin && !admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('✅ Firebase Admin initialized');
        }
    } catch (error) {
        console.error('Firebase Admin init error:', error.message);
    }
}

async function sendPushNotification(fcmToken, { title, body, data = {}, clickAction = '/' }) {
    if (!fcmToken || !admin || !admin.apps.length) return null;

    try {
        const message = {
            token: fcmToken,
            notification: { title, body },
            data: { ...data, click_action: clickAction },
            webpush: {
                fcmOptions: { link: clickAction },
                notification: {
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [200, 100, 200, 100, 200]
                }
            }
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Push notification error:', error.message);
        return { success: false, error: error.message };
    }
}

async function sendBulkPushNotifications(fcmTokens, notification) {
    if (!fcmTokens || !fcmTokens.length || !admin || !admin.apps.length) return [];
    const validTokens = fcmTokens.filter(t => typeof t === 'string' && t.trim().length > 0);
    return Promise.all(
        validTokens.map(token => sendPushNotification(token, notification))
    );
}

module.exports = { sendPushNotification, sendBulkPushNotifications };
