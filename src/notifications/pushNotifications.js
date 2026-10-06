import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { saveDeviceToken } from '@/lib/firebase';

const FCM_TOKEN_STORAGE_KEY = 'online-store-fcm-token';

function publishToken(token) {
  try {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
  } catch {
    // Token display should not block notification registration.
  }
  window.dispatchEvent(new CustomEvent('fcm-token-updated', { detail: token }));
}

/**
 * Initializes native push notifications.
 * The token is logged for testing and can later be sent to the backend.
 */
export async function initializePushNotifications({ onToken, onNotification, onAction } = {}) {
  if (!Capacitor.isNativePlatform()) {
    return { enabled: false, reason: 'web' };
  }

  const permission = await PushNotifications.checkPermissions();
  let receive = permission.receive;

  if (receive !== 'granted') {
    const requested = await PushNotifications.requestPermissions();
    receive = requested.receive;
  }

  if (receive !== 'granted') {
    console.warn('[Push] Notification permission was not granted:', receive);
    return { enabled: false, reason: 'permission-denied' };
  }

  if (Capacitor.getPlatform() === 'android') {
    await PushNotifications.createChannel({
      id: 'store-default',
      name: 'إشعارات المتجر',
      description: 'تنبيهات الطلبات والعروض الجديدة',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
  }

  await PushNotifications.addListener('registration', (token) => {
    // This is the FCM token on Android and the APNs/FCM token provided by iOS.
    console.info('[Push] Device token received:', token.value);
    publishToken(token.value);
    onToken?.(token.value);
    saveDeviceToken(token.value, Capacitor.getPlatform()).then(() => {
      console.info('[Push] Token saved in Firebase Firestore');
    }).catch((error) => {
      console.warn('[Push] Firebase token registration skipped:', error);
    });
  });

  await PushNotifications.addListener('registrationError', (error) => {
    console.error('[Push] Registration failed:', error);
  });

  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.info('[Push] Notification received:', notification);
    onNotification?.(notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
    console.info('[Push] Notification opened:', event);
    onAction?.(event);
  });

  await PushNotifications.register();
  return { enabled: true, permission: receive };
}
