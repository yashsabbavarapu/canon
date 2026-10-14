import Link from "next/link";
import { groupByTopic, listPieces } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Topics() {
  const groups = groupByTopic(await listPieces());
  return (
    <main>
      <h1 className="mb-4 text-xl font-semibold">Topics</h1>
      {groups.length === 0 && <p>No topics.</p>}
      <ul>
        {groups.map(([t, ps]) => (
          <li key={t} className="py-1">
            <Link href={`/?topic=${encodeURIComponent(t)}`} className="underline">{t}</Link> <span className="text-neutral-500">{ps.length}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
