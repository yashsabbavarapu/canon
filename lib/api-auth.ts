// Writes are gated by the server-only CANON_API_SECRET and the `x-canon-secret` header.
// Unset (local dev): writes are open and the UI says so.
import { timingSafeEqual } from "node:crypto";

export const AUTH_HEADER = "x-canon-secret";

export function writesAuthenticated(): boolean {
  return Boolean(process.env.CANON_API_SECRET);
}

export function requireWriteAuth(req: Request): boolean {
  const secret = process.env.CANON_API_SECRET;
  if (!secret) return true;
  const given = Buffer.from(req.headers.get(AUTH_HEADER) ?? "");
  const wanted = Buffer.from(secret);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
