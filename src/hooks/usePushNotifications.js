import { useCallback, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notificationApi } from '../features/notifications/api/notificationApi';
import env from '../config/env';

let firebaseApp = null;
let messagingInstance = null;

const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    });
  }
  return firebaseApp;
};

const getMessagingInstance = () => {
  if (!messagingInstance) {
    const app = getFirebaseApp();
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
};

export function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [fcmToken, setFcmToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const registerToken = useCallback(async () => {
    if (!env.FIREBASE_API_KEY || !env.FIREBASE_MESSAGING_SENDER_ID) return;
    if (isRegistering) return;
    setIsRegistering(true);
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const messaging = getMessagingInstance();
      const token = await getToken(messaging, {
        vapidKey: env.FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        setFcmToken(token);
        await notificationApi.registerDevice({
          firebase_token: token,
          device_type: 'WEB',
          device_name: navigator.platform || 'Web Browser',
        });
      }
    } catch {
    } finally {
      setIsRegistering(false);
    }
  }, [isRegistering]);

  useEffect(() => {
    if (!env.FIREBASE_API_KEY || !env.FIREBASE_MESSAGING_SENDER_ID) return;
    if (permission === 'granted') {
      const id = setTimeout(() => registerToken(), 0);
      return () => clearTimeout(id);
    }
  }, [registerToken, permission]);

  useEffect(() => {
    if (fcmToken) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
  }, [fcmToken]);

  useEffect(() => {
    if (!env.FIREBASE_API_KEY || !env.FIREBASE_MESSAGING_SENDER_ID) return;
    try {
      const messaging = getMessagingInstance();
      const unsubscribe = onMessage(messaging, (payload) => {
        const { title, body, icon, click_action } = payload.data || {};
        if (title) {
          new Notification(title, {
            body: body || '',
            icon: icon || '/icon-192.png',
            data: { url: click_action || '/' },
          });
        }
      });
      return unsubscribe;
    } catch {
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await registerToken();
      }
    } catch {
    }
  };

  return { permission, fcmToken, isRegistering, requestPermission };
}
