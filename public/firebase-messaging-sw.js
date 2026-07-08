importScripts('https://www.gstatic.com/firebasejs/10.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.15.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAZPz-NW8_Q4Rf-F9ZKs_yNo57oY4IO58M',
  authDomain: 'sacco-bridge1.firebaseapp.com',
  projectId: 'sacco-bridge1',
  storageBucket: 'sacco-bridge1.firebasestorage.app',
  messagingSenderId: '492687684737',
  appId: '1:492687684737:web:ad266868161a4f1acec980',
  measurementId: 'G-6QPF8GX1PT',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.data || {};
  self.registration.showNotification(title || 'Sacco Bridge', {
    body: body || '',
    icon: icon || '/icon-192.png',
    data: { url: click_action || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
