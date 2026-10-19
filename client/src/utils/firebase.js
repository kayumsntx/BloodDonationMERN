import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from './api';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app = null;
let messaging = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        app = initializeApp(firebaseConfig);
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            messaging = getMessaging(app);
        }
    } catch (err) {
        console.warn('Firebase initialization skipped or error:', err.message);
    }
}

export { messaging };

export async function requestNotificationPermission() {
    if (!messaging || typeof window === 'undefined' || !('Notification' in window)) return null;
    
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) return null;

        const token = await getToken(messaging, { vapidKey });

        if (token) {
            // Send token to server
            await api.post('/users/fcm-token', { fcmToken: token });
            console.log('✅ FCM token registered');
        }

        return token;
    } catch (error) {
        console.warn('FCM registration notice:', error.message);
        return null;
    }
}

export function setupForegroundMessages(callback) {
    if (!messaging) return;
    try {
        onMessage(messaging, (payload) => {
            callback({
                title: payload.notification?.title,
                body: payload.notification?.body,
                data: payload.data
            });
        });
    } catch (err) {
        console.warn('Foreground message setup notice:', err.message);
    }
}
