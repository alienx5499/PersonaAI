type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

type Bucket = {
  count: number;
  resetAtMs: number;
};

const DEFAULT_LIMIT = 6;
const DEFAULT_WINDOW_MS = 60_000;

function getGlobalStore() {
  const g = globalThis as unknown as {
    __personaai_rate_limit_store__?: Map<string, Bucket>;
  };
  if (!g.__personaai_rate_limit_store__) {
    g.__personaai_rate_limit_store__ = new Map();
  }
  return g.__personaai_rate_limit_store__!;
}

export function checkRateLimit(params: {
  key: string;
  limit?: number;
  windowMs?: number;
}): RateLimitResult {
  const store = getGlobalStore();
  const limit = params.limit ?? DEFAULT_LIMIT;
  const windowMs = params.windowMs ?? DEFAULT_WINDOW_MS;

  const now = Date.now();
  const existing = store.get(params.key);
  if (!existing || now >= existing.resetAtMs) {
    store.set(params.key, { count: 1, resetAtMs: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAtMs - now };
  }

  existing.count += 1;
  store.set(params.key, existing);
  return { allowed: true };
}
