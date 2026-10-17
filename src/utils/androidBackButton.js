import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export async function registerAndroidBackButton(handler) {
  if (Capacitor.getPlatform() !== 'android') return () => {};
  try {
    const listener = await App.addListener('backButton', () => {
      try {
        const result = handler?.();
        if (result?.catch) result.catch((error) => console.warn('[Android] Back handler failed:', error));
      } catch (error) {
        console.warn('[Android] Back handler failed:', error);
      }
    });
    return () => { void listener.remove().catch?.(() => {}); };
  } catch (error) {
    console.warn('[Android] Could not register back button:', error);
    return () => {};
  }
}

export function exitAndroidApp() {
  if (Capacitor.getPlatform() === 'android') return App.exitApp().catch?.(() => {});
  return undefined;
}
