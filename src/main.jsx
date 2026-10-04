import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import App from './App.jsx';
import './index.css';
import { initializePushNotifications } from './notifications/pushNotifications.js';

// Must run before network requests so Capgo can roll back a broken bundle.
CapacitorUpdater.notifyAppReady().catch((error) => {
  console.warn('[OTA] Could not confirm app readiness:', error);
});

createRoot(document.getElementById('root')).render(<StrictMode>
    <App />
  </StrictMode>);

initializePushNotifications({
  onToken: (token) => {
    // TODO: send this token to the store backend when device subscriptions are added.
    console.info('[Push] Token ready for backend registration:', token);
  },
}).catch((error) => {
  // Push setup must never prevent the storefront from loading.
  console.warn('[Push] Initialization skipped:', error);
});

import('./ota/githubOta.js').then(({ startOtaChecks }) => {
  startOtaChecks();
});
