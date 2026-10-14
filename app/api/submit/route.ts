import { AUTH_HEADER } from "@/lib/api-auth";
import { POST as createPieceRoute } from "../pieces/route";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy for the /new form. The secret is read here and attached
 * before calling the same handler as POST /api/pieces, so it never reaches
 * the client bundle.
 */
export async function POST(req: Request) {
  const headers = new Headers(req.headers);
  const secret = process.env.CANON_API_SECRET;
  if (secret) headers.set(AUTH_HEADER, secret);
  return createPieceRoute(new Request(req.url, { method: "POST", headers, body: await req.text() }));
}
