/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

try {
    firebase.initializeApp({
        apiKey: "FIREBASE_API_KEY",
        authDomain: "blood-donation-app.firebaseapp.com",
        projectId: "blood-donation-app",
        storageBucket: "blood-donation-app.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:1234567890:web:abcdef"
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[SW] Background message:', payload);
        
        const { title, body, icon, click_action } = payload.notification || {};
        
        self.registration.showNotification(title || '🩸 Blood Donation', {
            body: body || 'New notification',
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            data: { url: click_action || '/' }
        });
    });
} catch (e) {
    console.error('Service worker firebase init error:', e);
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
