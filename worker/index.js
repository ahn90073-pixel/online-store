import { neon } from '@neondatabase/serverless';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'online-store-api' });
    }

    if (request.method === 'GET' && url.pathname === '/db-check') {
      if (!env.DATABASE_URL) return json({ ok: false, error: 'DATABASE_URL is not configured' }, 500);
      try {
        const sql = neon(env.DATABASE_URL);
        const [row] = await sql`select 1 as connected`;
        return json({ ok: row?.connected === 1, database: 'neon' });
      } catch (error) {
        console.error('Neon connection failed:', error instanceof Error ? error.message : 'unknown error');
        return json({ ok: false, error: 'database-connection-failed' }, 502);
      }
    }

    return json({ error: 'not-found' }, 404);
  },
};
