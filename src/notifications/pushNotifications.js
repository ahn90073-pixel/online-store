import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const FCM_TOKEN_STORAGE_KEY = 'online-store-fcm-token';
let initializationPromise = null;

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

  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const listeners = [];
    try {
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

      listeners.push(await PushNotifications.addListener('registration', (token) => {
        // This is the FCM token on Android and the APNs/FCM token provided by iOS.
        console.info('[Push] Device token received');
        publishToken(token.value);
        onToken?.(token.value);
      }));

      listeners.push(await PushNotifications.addListener('registrationError', (error) => {
        console.error('[Push] Registration failed:', error);
      }));

      listeners.push(await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.info('[Push] Notification received:', notification);
        onNotification?.(notification);
      }));

      listeners.push(await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
        console.info('[Push] Notification opened:', event);
        onAction?.(event);
      }));

      await PushNotifications.register();
      return { enabled: true, permission: receive };
    } catch (error) {
      for (const listener of listeners) await listener.remove().catch(() => {});
      throw error;
    }
  })();

  try {
    const result = await initializationPromise;
    if (!result.enabled) initializationPromise = null;
    return result;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

export function getStoredFcmToken() {
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}
