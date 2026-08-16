/**
 * In-memory sliding-window limiter.
 *
 * Adequate for a single long-lived server process, which is how this site is
 * deployed. It is per-instance, so behind several replicas or on a serverless
 * platform each instance keeps its own counter — swap in a shared store
 * (Redis, Upstash) if the deployment fans out.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_KEYS = 10_000;

const hits = new Map<string, number[]>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    const retryAfterSeconds = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-running process.
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [entryKey, times] of hits) {
      if (times.every((time) => time <= cutoff)) hits.delete(entryKey);
    }
  }

  return {
    ok: true,
    remaining: MAX_REQUESTS - recent.length,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client identity from proxy headers. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
