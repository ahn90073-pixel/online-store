import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const REGISTER_TOKEN_URL =
  'https://europe-west1-coffee-spark-ai-barista-c481f.cloudfunctions.net/registerDeviceToken';

async function registerTokenWithFirebase(token) {
  const response = await CapacitorHttp.post({
    url: REGISTER_TOKEN_URL,
    headers: { 'Content-Type': 'application/json' },
    data: {
      token,
      platform: Capacitor.getPlatform(),
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Firebase token registration returned ${response.status}`);
  }
  console.info('[Push] Token saved in Firebase Firestore');
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
    onToken?.(token.value);
    registerTokenWithFirebase(token.value).catch((error) => {
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
