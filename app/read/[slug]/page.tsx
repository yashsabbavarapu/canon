import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { getPiece } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Read({ params }: { params: { slug: string } }) {
  const p = await getPiece(params.slug);
  if (!p) notFound();
  return (
    <article>
      <h1 className="text-3xl font-semibold leading-tight">{p.title}</h1>
      <p className="mb-6 mt-2 text-sm text-neutral-500">
        {p.published_at.slice(0, 10)} · {p.source}
        {p.url && <> · <a href={p.url} className="underline" rel="noopener noreferrer">canonical</a></>}
        {p.topics.length > 0 && <> · {p.topics.map((t, i) => (<span key={t}>{i > 0 && ", "}<Link href={`/?topic=${encodeURIComponent(t)}`} className="underline">{t}</Link></span>))}</>}
      </p>
      <Markdown source={p.body_markdown} />
    </article>
  );
}
