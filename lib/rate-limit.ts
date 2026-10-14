const WINDOW_MS = 60_000;
const MAX = 30;
const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

/** Returns seconds to wait if over the limit, else 0. In-memory per instance. */
export function rateLimit(ip: string, now = Date.now()): number {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX) {
    hits.set(ip, recent);
    return Math.max(1, Math.ceil((WINDOW_MS - (now - (recent[0] ?? now))) / 1000));
  }
  recent.push(now);
  hits.set(ip, recent);
  return 0;
}
