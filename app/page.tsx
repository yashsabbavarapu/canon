import Link from "next/link";
import { PieceRow } from "@/components/PieceRow";
import { filterPieces, groupByTopic, listPieces } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { q?: string; topic?: string } }) {
  const q = searchParams.q ?? "";
  const topic = searchParams.topic ?? "";
  const pieces = filterPieces(await listPieces(), q, topic);
  return (
    <main>
      <form className="mb-6 flex gap-2" action="/">
        <input name="q" defaultValue={q} placeholder="Search title, summary, topics, body" className="w-full border px-2 py-1" />
        {topic && <input type="hidden" name="topic" value={topic} />}
        <button className="border px-3 py-1">Search</button>
      </form>
      {(q || topic) && (
        <p className="mb-4 text-sm">
          {pieces.length} result(s){q && <> for &quot;{q}&quot;</>}{topic && <> in {topic}</>}. <Link href="/" className="underline">Clear</Link>
        </p>
      )}
      {pieces.length === 0 && <p>No pieces.</p>}
      {groupByTopic(pieces).map(([t, ps]) => (
        <section key={t} className="mb-8">
          <h2 className="font-semibold">{t} <span className="font-normal text-neutral-500">({ps.length})</span></h2>
          <ul className="divide-y">{ps.map((p) => <PieceRow key={p.slug} p={p} />)}</ul>
        </section>
      ))}
    </main>
  );
}
