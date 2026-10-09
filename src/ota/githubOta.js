import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const OTA_MANIFEST_URL =
  'https://github.com/ahn90073-pixel/online-store/releases/download/ota-latest/ota-manifest.json';
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
  const url = `${OTA_MANIFEST_URL}?t=${Date.now()}`;
  let manifest;
  if (Capacitor.isNativePlatform()) {
    // GitHub redirects the release URL to release-assets.githubusercontent.com.
    // Use the native HTTP stack so Android WebView CORS cannot block the manifest.
    const response = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`OTA manifest returned ${response.status}`);
    }
    manifest = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  } else {
    const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`OTA manifest returned ${response.status}`);
    manifest = await response.json();
  }
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

function normalizeBundleUrl(bundleUrl) {
  const url = new URL(bundleUrl);
  // Older manifests omitted the archive extension. CapacitorUpdater expects
  // the actual ZIP asset, so keep old releases compatible as well.
  if (!url.pathname.endsWith('.zip')) url.pathname = `${url.pathname}.zip`;
  // Ask GitHub for the binary asset instead of an HTML release response.
  url.searchParams.set('download', '1');
  return url.toString();
}

export async function checkForOtaUpdate({ force = false, onStatus } = {}) {
  if (!Capacitor.isNativePlatform()) return { updated: false, skipped: true };

  onStatus?.('الاتصال بـ GitHub...');
  const manifest = await readManifest();
  onStatus?.(`تم العثور على OTA ${manifest.version}`);
  const current = await CapacitorUpdater.current();
  const currentVersion = current?.bundle?.version || '';
  if (!force && !isNewerVersion(manifest.version, currentVersion)) {
    return { updated: false, version: currentVersion || 'النسخة المدمجة' };
  }

  onStatus?.('جاري تنزيل حزمة OTA...');
  const downloaded = await CapacitorUpdater.download({
    version: manifest.version,
    url: normalizeBundleUrl(manifest.bundleUrl),
    checksum: manifest.sha256,
  });

  onStatus?.('تم التنزيل، جاري تفعيل التحديث...');
  // Capgo treats set() as terminal: it activates the bundle and reloads the app.
  await CapacitorUpdater.set(downloaded);
  return { updated: true, version: manifest.version };
}

export function startOtaChecks() {
  if (!Capacitor.isNativePlatform()) return () => {};

  let checking = false;
  const check = async () => {
    if (checking) return;
    checking = true;
    try {
      await checkForOtaUpdate({ onStatus: (message) => console.info(`[OTA] ${message}`) });
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
