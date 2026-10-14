"use client";
import Link from "next/link";
import { useState } from "react";

export function NewForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string; slug?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: f.get("title"),
        body_markdown: f.get("body_markdown"),
        topics: String(f.get("topics") ?? ""),
        summary: f.get("summary"),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) setMsg({ ok: true, text: "Added.", slug: json.piece.slug });
    else setMsg({ ok: false, text: `${res.status}: ${json.error ?? "Failed."}` });
  }

  const cls = "w-full border px-2 py-1";
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">Title<input name="title" required className={cls} /></label>
      <label className="block text-sm">Summary<input name="summary" className={cls} /></label>
      <label className="block text-sm">Topics (comma separated)<input name="topics" className={cls} /></label>
      <label className="block text-sm">Body (markdown)<textarea name="body_markdown" required rows={14} className={`${cls} font-mono`} /></label>
      <button disabled={busy} className="border px-3 py-1">{busy ? "Adding" : "Add piece"}</button>
      {msg && (
        <p className="text-sm" role="status">
          {msg.text} {msg.slug && <Link href={`/read/${msg.slug}`} className="underline">Read it</Link>}
        </p>
      )}
    </form>
  );
}
