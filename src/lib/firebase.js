import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

// Firebase Web configuration is public client configuration, not an Admin credential.
// Values are supplied through VITE_FIREBASE_* environment variables at build time.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseWebConfig = ['apiKey', 'authDomain', 'projectId', 'appId']
  .every((key) => firebaseConfig[key]);

const app = hasFirebaseWebConfig
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
let anonymousUserPromise;

export function ensureFirebaseUser() {
  if (!auth) {
    return Promise.reject(new Error('Firebase Web configuration is missing. Set VITE_FIREBASE_* values.'));
  }
  if (!anonymousUserPromise) {
    anonymousUserPromise = auth.currentUser
      ? Promise.resolve(auth.currentUser)
      : signInAnonymously(auth).then(({ user }) => user);
    anonymousUserPromise.catch(() => {
      anonymousUserPromise = undefined;
    });
  }
  return anonymousUserPromise;
}

async function hashToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function saveDeviceToken(token, platform) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const user = await ensureFirebaseUser();
      const tokenId = await hashToken(token);
      await setDoc(doc(db, 'users', user.uid, 'device_tokens', tokenId), {
        token,
        platform,
        enabled: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function loadCart() {
  const user = await ensureFirebaseUser();
  const snapshot = await getDoc(doc(db, 'carts', user.uid));
  return snapshot.exists() && Array.isArray(snapshot.data().items) ? snapshot.data().items : [];
}

export async function saveCart(items) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const user = await ensureFirebaseUser();
      await setDoc(doc(db, 'carts', user.uid), {
        items,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}
