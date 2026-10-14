import { listLog, listPieces, seedState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  await listPieces();
  const [log, state] = await Promise.all([listLog(), seedState()]);
  return (
    <main>
      <h1 className="mb-1 text-xl font-semibold">Log</h1>
      <p className="mb-4 text-sm text-neutral-500">Append-only. Seed state: {state}.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr><th className="pr-4">Time (UTC)</th><th className="pr-4">Action</th><th>Detail</th></tr></thead>
          <tbody>
            {[...log].reverse().map((e, i) => (
              <tr key={i} className="border-t align-top">
                <td className="whitespace-nowrap pr-4">{e.at.replace("T", " ").slice(0, 19)}</td>
                <td className="pr-4">{e.action}</td>
                <td>{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
