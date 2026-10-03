import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import App from './App.jsx';
import './index.css';

// Must run before network requests so Capgo can roll back a broken bundle.
CapacitorUpdater.notifyAppReady().catch((error) => {
  console.warn('[OTA] Could not confirm app readiness:', error);
});

createRoot(document.getElementById('root')).render(<StrictMode>
    <App />
  </StrictMode>);

import('./ota/githubOta.js').then(({ startOtaChecks }) => {
  startOtaChecks();
});
