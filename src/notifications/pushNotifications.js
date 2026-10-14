import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const FCM_TOKEN_STORAGE_KEY = 'online-store-fcm-token';
const FCM_PERMISSION_STATE_KEY = 'online-store-fcm-permission-state';
let initializationPromise = null;

function savePermissionState(state) {
  try {
    localStorage.setItem(FCM_PERMISSION_STATE_KEY, state);
  } catch {
    // Permission state persistence should not block registration.
  }
}

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
 * The token is persisted locally and, when supplied, acknowledged by the backend.
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
        savePermissionState(receive || 'denied');
        return { enabled: false, reason: 'permission-denied' };
      }
      savePermissionState('granted');

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

      let resolveToken;
      let rejectToken;
      const tokenReady = new Promise((resolve, reject) => {
        resolveToken = resolve;
        rejectToken = reject;
      });
      listeners.push(await PushNotifications.addListener('registration', async (token) => {
        // This is the FCM token on Android and the APNs/FCM token provided by iOS.
        console.info('[Push] Device token received');
        publishToken(token.value);
        savePermissionState('registered');
        try {
          await onToken?.(token.value);
          resolveToken(token.value);
        } catch (error) {
          rejectToken(error);
        }
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
      let timeoutId;
      try {
        const token = await Promise.race([
          tokenReady,
          new Promise((_, reject) => {
            timeoutId = window.setTimeout(() => reject(new Error('انتهت مهلة تسجيل رمز الإشعارات.')), 20000);
          }),
        ]);
        return { enabled: true, permission: receive, token };
      } finally {
        window.clearTimeout(timeoutId);
      }
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

export function getStoredPushPermissionState() {
  try {
    return localStorage.getItem(FCM_PERMISSION_STATE_KEY) || '';
  } catch {
    return '';
  }
}
