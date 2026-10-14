import Link from "next/link";
import type { Piece } from "@/lib/types";

export function PieceRow({ p }: { p: Piece }) {
  return (
    <li className="py-2">
      <Link href={`/read/${p.slug}`} className="underline">{p.title}</Link>
      <span className="ml-2 text-sm text-neutral-500">{p.published_at.slice(0, 10)}</span>
      {p.summary && <p className="text-sm text-neutral-700">{p.summary}</p>}
    </li>
  );
}
