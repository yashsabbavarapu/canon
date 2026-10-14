import { NextResponse } from "next/server";
import { requireWriteAuth } from "@/lib/api-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { appendLog, createPiece, filterPieces, listPieces } from "@/lib/store";
import { parsePieceInput } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const pieces = filterPieces(await listPieces(), sp.get("q") ?? "", sp.get("topic") ?? "");
  return NextResponse.json({ pieces });
}

export async function POST(req: Request) {
  const wait = rateLimit(clientIp(req));
  if (wait) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(wait) } });
  }
  if (!requireWriteAuth(req)) {
    await appendLog("rejected", "POST /api/pieces without a valid secret.");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }
  const parsed = parsePieceInput(json);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const res = await createPiece(parsed.piece);
  if (!res.ok) {
    return NextResponse.json({ error: "A piece with this slug already exists.", existing: res.existing }, { status: 409 });
  }
  return NextResponse.json({ piece: res.piece }, { status: 201 });
}
