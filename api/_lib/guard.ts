/* Protects your API credits: optional access code + a per-visitor rate limit.
   The limit lives in the function's memory, so it is best-effort (it resets when
   Vercel starts a fresh instance) but needs no extra service. */

const hits = new Map<string, { n: number; reset: number }>();

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
}

export function checkAccess(req: Request): Response | null {
  const code = process.env.APP_ACCESS_CODE?.trim();
  if (code && req.headers.get('x-ahaara-code') !== code) {
    return json({ ok: false, error: 'access_code', message: 'This Ahaara needs an access code. Add it in Profile → AI engine.' }, 401);
  }
  const limit = Number(process.env.RATE_LIMIT_PER_MINUTE || 10);
  const ip = clientIp(req);
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) hits.set(ip, { n: 1, reset: now + 60_000 });
  else if (++h.n > limit) {
    return json({ ok: false, error: 'rate_limited', message: 'Too many questions in a minute — take a breath and try again shortly.' }, 429);
  }
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  return null;
}

/* Small in-memory cache so the same text question doesn't cost twice. */
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 60 * 60 * 1000;
export function cacheGet(key: string) {
  const c = cache.get(key);
  if (c && Date.now() - c.at < TTL) return c.value;
  cache.delete(key);
  return undefined;
}
export function cacheSet(key: string, value: unknown) {
  if (cache.size > 300) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), value });
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
