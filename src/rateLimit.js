// Tiny in-memory fixed-window rate limiter (per key, usually IP). Fine for a demo;
// use a shared store (Redis) if you ever run more than one instance.
export function createLimiter({ windowMs, max }) {
  const buckets = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
  }, 60_000);
  timer.unref();
  return (key) => {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.reset) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
    return ++b.n <= max;
  };
}
