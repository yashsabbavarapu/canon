import { NextResponse } from "next/server";
import { listLog, listPieces } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  await listPieces(); // makes sure the seed has been attempted and logged
  return NextResponse.json({ log: await listLog() });
}
