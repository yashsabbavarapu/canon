import Link from "next/link";
import { writesAuthenticated } from "@/lib/api-auth";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b pb-3 text-sm">
        <Link href="/" className="font-semibold">Canon</Link>
        <Link href="/topics" className="underline">Topics</Link>
        <Link href="/new" className="underline">New piece</Link>
        <Link href="/log" className="underline">Log</Link>
        {!writesAuthenticated() && <span className="text-neutral-500">API writes are unauthenticated.</span>}
      </header>
      {children}
    </div>
  );
}
