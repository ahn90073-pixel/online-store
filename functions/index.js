const crypto = require('node:crypto');
const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = getFirestore();

function allowCors(response) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

function tokenDocumentId(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Saves or refreshes one device token. Admin SDK writes bypass client Firestore rules.
 */
exports.registerDeviceToken = onRequest(async (request, response) => {
  allowCors(response);
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const { token, platform, appVersion = null, userId = null } = request.body || {};
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096) {
    response.status(400).json({ error: 'invalid-token' });
    return;
  }
  if (!['android', 'ios'].includes(platform)) {
    response.status(400).json({ error: 'invalid-platform' });
    return;
  }

  const ref = db.collection('device_tokens').doc(tokenDocumentId(token));
  await ref.set({
    token,
    platform,
    appVersion: typeof appVersion === 'string' ? appVersion.slice(0, 40) : null,
    userId: typeof userId === 'string' ? userId : null,
    enabled: true,
    lastSeenAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  response.status(200).json({ ok: true });
});

/**
 * Sends a campaign to registered devices. Requires a Firebase Auth custom admin claim.
 * Set it later with Firebase Admin; never expose this endpoint without authorization.
 */
exports.sendNotification = onCall(async (request) => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  const { title, body, platform = 'all', data = {} } = request.data || {};
  if (typeof title !== 'string' || !title.trim() || typeof body !== 'string' || !body.trim()) {
    throw new HttpsError('invalid-argument', 'title and body are required.');
  }

  let query = db.collection('device_tokens').where('enabled', '==', true);
  if (platform !== 'all') query = query.where('platform', '==', platform);
  const snapshot = await query.get();
  const records = snapshot.docs.map((doc) => ({ ref: doc.ref, ...doc.data() }));
  const tokens = records.map((record) => record.token).filter(Boolean);

  let sent = 0;
  let removed = 0;
  for (let offset = 0; offset < tokens.length; offset += 500) {
    const batchRecords = records.slice(offset, offset + 500);
    const result = await getMessaging().sendEachForMulticast({
      tokens: batchRecords.map((record) => record.token),
      notification: { title: title.trim(), body: body.trim() },
      data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
    });
    sent += result.successCount;

    const cleanup = [];
    result.responses.forEach((item, index) => {
      const code = item.error?.code || '';
      if (code.includes('registration-token-not-registered') || code.includes('invalid-registration-token')) {
        cleanup.push(batchRecords[index].ref.delete());
        removed += 1;
      }
    });
    await Promise.all(cleanup);
  }

  return { ok: true, targeted: tokens.length, sent, removed };
});
