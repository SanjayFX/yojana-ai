type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

function cleanupExpired(now: number) {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { max: 10, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      ok: true,
      remaining: options.max - 1,
      resetAt: now + options.windowMs,
    };
  }

  if (current.count >= options.max) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    ok: true,
    remaining: options.max - current.count,
    resetAt: current.resetAt,
  };
}
