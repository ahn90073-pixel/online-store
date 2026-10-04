import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

// Firebase Web configuration is public client configuration, not an Admin credential.
const firebaseConfig = {
  apiKey: 'AIzaSyBDfBs-5m5Xp-ZZUQjpo-V8-WT28X3SSic',
  authDomain: 'coffee-spark-ai-barista-c481f.firebaseapp.com',
  databaseURL: 'https://coffee-spark-ai-barista-c481f-default-rtdb.firebaseio.com',
  projectId: 'coffee-spark-ai-barista-c481f',
  storageBucket: 'coffee-spark-ai-barista-c481f.firebasestorage.app',
  messagingSenderId: '961126455294',
  appId: '1:961126455294:web:fabd50bdaa83b0408bd2af',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let anonymousUserPromise;

export function ensureFirebaseUser() {
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
  const snapshot = await getDoc(doc(db, 'users', user.uid, 'cart', 'current'));
  return snapshot.exists() && Array.isArray(snapshot.data().items) ? snapshot.data().items : [];
}

export async function saveCart(items) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const user = await ensureFirebaseUser();
      await setDoc(doc(db, 'users', user.uid, 'cart', 'current'), {
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
