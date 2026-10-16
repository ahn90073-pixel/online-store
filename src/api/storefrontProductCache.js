import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const DATABASE_NAME = 'storefront_catalog';
const CACHE_KEY = 'products';
let databasePromise;

function isAndroidApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

async function getDatabase() {
  if (!isAndroidApp()) return null;
  if (!databasePromise) {
    databasePromise = (async () => {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      const existing = await sqlite.isConnection(DATABASE_NAME, false);
      const db = existing.result
        ? await sqlite.retrieveConnection(DATABASE_NAME, false)
        : await sqlite.createConnection(DATABASE_NAME, false, 'no-encryption', 1, false);
      const open = await db.isDBOpen();
      if (!open.result) await db.open();
      await db.execute(`CREATE TABLE IF NOT EXISTS storefront_products (
        product_id TEXT PRIMARY KEY NOT NULL,
        position INTEGER NOT NULL,
        payload TEXT NOT NULL
      )`);
      await db.execute(`CREATE TABLE IF NOT EXISTS storefront_cache_meta (
        cache_key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      )`);
      return db;
    })().catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}

/** Returns null when no snapshot exists; an empty array is a valid cached catalog. */
export async function readCachedStorefrontProducts() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    const marker = await db.query('SELECT value FROM storefront_cache_meta WHERE cache_key = ?', [CACHE_KEY]);
    if (!marker.values?.length) return null;
    const result = await db.query('SELECT payload FROM storefront_products ORDER BY position ASC');
    return (result.values || []).map((row) => JSON.parse(row.payload)).filter(Boolean);
  } catch (error) {
    console.warn('[Catalog] SQLite read failed; loading from network.', error);
    return null;
  }
}

/** Atomically replaces the cached catalog after a successful server response. */
export async function saveCachedStorefrontProducts(products) {
  if (!Array.isArray(products)) return false;
  try {
    const db = await getDatabase();
    if (!db) return false;
    await db.beginTransaction();
    try {
      await db.run('DELETE FROM storefront_products', [], false);
      const rows = products
        .filter((product) => product?.vendorId && (product?.productId || product?.id))
        .map((product, position) => ({
          statement: 'INSERT INTO storefront_products (product_id, position, payload) VALUES (?, ?, ?)',
          values: [`${product.vendorId}:${product.productId || product.id}`, position, JSON.stringify(product)],
        }));
      if (rows.length) await db.executeSet(rows, false);
      await db.run(
        'INSERT OR REPLACE INTO storefront_cache_meta (cache_key, value) VALUES (?, ?)',
        [CACHE_KEY, new Date().toISOString()],
        false,
      );
      await db.commitTransaction();
      return true;
    } catch (error) {
      await db.rollbackTransaction();
      throw error;
    }
  } catch (error) {
    console.warn('[Catalog] SQLite write failed; keeping products in memory.', error);
    return false;
  }
}
