type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt });

    return { allowed: true, remaining: Math.max(limit - 1, 0) };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
  };
}
