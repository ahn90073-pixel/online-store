import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const OTA_MANIFEST_URL =
  'https://github.com/ahn90073-pixel/online-store/releases/download/ota-latest/ota-manifest.json';
const OTA_VERSION_KEY = 'online-store-ota-version';

function isNewerVersion(nextVersion, currentVersion) {
  if (!currentVersion) return true;
  const next = String(nextVersion).split('.').map(Number);
  const current = String(currentVersion).split('.').map(Number);
  for (let i = 0; i < Math.max(next.length, current.length); i += 1) {
    const a = Number.isFinite(next[i]) ? next[i] : 0;
    const b = Number.isFinite(current[i]) ? current[i] : 0;
    if (a !== b) return a > b;
  }
  return false;
}

async function readManifest() {
  const response = await fetch(`${OTA_MANIFEST_URL}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`OTA manifest returned ${response.status}`);
  const manifest = await response.json();
  if (
    manifest.appId !== 'com.ahn90073.onlinestore' ||
    !manifest.version ||
    !manifest.bundleUrl ||
    !/^[a-f0-9]{64}$/i.test(manifest.sha256)
  ) {
    throw new Error('Invalid OTA manifest');
  }
  return manifest;
}

export async function checkForOtaUpdate() {
  if (!Capacitor.isNativePlatform()) return { updated: false, skipped: true };

  const manifest = await readManifest();
  const currentVersion = localStorage.getItem(OTA_VERSION_KEY);
  if (!isNewerVersion(manifest.version, currentVersion)) {
    return { updated: false, version: currentVersion };
  }

  const downloaded = await CapacitorUpdater.download({
    version: manifest.version,
    url: manifest.bundleUrl,
    checksum: manifest.sha256,
  });

  await CapacitorUpdater.next({ id: downloaded.id });
  localStorage.setItem(OTA_VERSION_KEY, manifest.version);
  return { updated: true, version: manifest.version };
}

export function startOtaChecks() {
  if (!Capacitor.isNativePlatform()) return () => {};

  let checking = false;
  const check = async () => {
    if (checking) return;
    checking = true;
    try {
      await checkForOtaUpdate();
    } catch (error) {
      // OTA must never block the storefront; the built-in bundle remains available.
      console.warn('[OTA] Update skipped:', error);
    } finally {
      checking = false;
    }
  };

  const timer = window.setTimeout(check, 2500);
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') check();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export { OTA_MANIFEST_URL };
