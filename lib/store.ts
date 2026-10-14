import { kv } from "@vercel/kv";
import type { LogEntry, Piece } from "./types";
import { FALLBACK_PIECES } from "./fallback-pieces";
import { fetchHashnode } from "./hashnode";

const useKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const PIECES = "canon:pieces"; // hash: slug -> Piece
const LOG = "canon:log"; // list, append-only
const META = "canon:meta"; // hash: seed state

// In-memory fallback, kept on globalThis so dev reloads do not drop it.
type Mem = { pieces: Map<string, Piece>; log: LogEntry[]; meta: Map<string, string> };
const g = globalThis as unknown as { __canon?: Mem };
const mem: Mem = (g.__canon ??= { pieces: new Map(), log: [], meta: new Map() });

export function storageKind(): "kv" | "memory" {
  return useKv ? "kv" : "memory";
}

export async function appendLog(action: string, detail: string): Promise<void> {
  const entry: LogEntry = { at: new Date().toISOString(), action, detail };
  if (useKv) await kv.rpush(LOG, JSON.stringify(entry));
  else mem.log.push(entry);
}

export async function listLog(): Promise<LogEntry[]> {
  if (useKv) {
    const raw = await kv.lrange<LogEntry | string>(LOG, 0, -1);
    return raw.map((r) => (typeof r === "string" ? (JSON.parse(r) as LogEntry) : r));
  }
  return [...mem.log];
}

async function getMeta(key: string): Promise<string | null> {
  if (useKv) return ((await kv.hget(META, key)) as string | null) ?? null;
  return mem.meta.get(key) ?? null;
}

async function setMeta(key: string, value: string): Promise<void> {
  if (useKv) await kv.hset(META, { [key]: value });
  else mem.meta.set(key, value);
}

async function allRaw(): Promise<Piece[]> {
  if (useKv) {
    const h = await kv.hgetall<Record<string, Piece | string>>(PIECES);
    return Object.values(h ?? {}).map((v) => (typeof v === "string" ? (JSON.parse(v) as Piece) : v));
  }
  return [...mem.pieces.values()];
}

async function put(p: Piece): Promise<void> {
  if (useKv) await kv.hset(PIECES, { [p.slug]: JSON.stringify(p) });
  else mem.pieces.set(p.slug, p);
}

async function getRaw(slug: string): Promise<Piece | null> {
  if (useKv) {
    const v = await kv.hget<Piece | string>(PIECES, slug);
    if (!v) return null;
    return typeof v === "string" ? (JSON.parse(v) as Piece) : v;
  }
  return mem.pieces.get(slug) ?? null;
}

const RETRY_MS = 60_000;
let lastAttempt = 0;
let inflight: Promise<void> | null = null;

/**
 * Seeds from Hashnode. State "live" means done. State "fallback" means the
 * local fallback pieces are in place and the fetch is retried on later
 * requests (at most once per minute), each attempt logged.
 */
async function seed(): Promise<void> {
  const state = await getMeta("seed");
  if (state === "live") return;
  if (state === "fallback" && Date.now() - lastAttempt < RETRY_MS) return;
  lastAttempt = Date.now();
  try {
    const { pieces, via } = await fetchHashnode();
    for (const p of pieces) await put(p);
    // Known articles the live source does not list stay as fallback entries.
    for (const f of FALLBACK_PIECES) {
      if (!pieces.some((p) => p.slug === f.slug)) await put(f);
    }
    const missing = FALLBACK_PIECES.filter((f) => !pieces.some((p) => p.slug === f.slug)).length;
    await setMeta("seed", "live");
    await appendLog(
      "seed",
      `Fetched ${pieces.length} pieces from Hashnode via ${via}.` +
        (missing ? ` ${missing} known article(s) not in the live source, kept from fallback.` : ""),
    );
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    if (state !== "fallback") {
      for (const f of FALLBACK_PIECES) if (!(await getRaw(f.slug))) await put(f);
      await setMeta("seed", "fallback");
      await appendLog("seed", `Hashnode unreachable (${reason}). Seeded ${FALLBACK_PIECES.length} fallback pieces; will retry.`);
    } else {
      await appendLog("seed-retry", `Hashnode still unreachable (${reason}).`);
    }
  }
}

async function ensureSeeded(): Promise<void> {
  inflight ??= seed().finally(() => {
    inflight = null;
  });
  await inflight;
}

export async function listPieces(): Promise<Piece[]> {
  await ensureSeeded();
  return (await allRaw()).sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export async function getPiece(slug: string): Promise<Piece | null> {
  await ensureSeeded();
  return getRaw(slug);
}

export async function seedState(): Promise<string> {
  return (await getMeta("seed")) ?? "none";
}

export type CreateResult = { ok: true; piece: Piece } | { ok: false; existing: Piece };

/** Creates an original piece. Fails with the existing record on a duplicate slug. */
export async function createPiece(p: Piece): Promise<CreateResult> {
  await ensureSeeded();
  const existing = await getRaw(p.slug);
  if (existing) return { ok: false, existing };
  await put(p);
  await appendLog("create", `Added original piece "${p.title}" (${p.slug}).`);
  return { ok: true, piece: p };
}

export function filterPieces(pieces: Piece[], q: string, topic: string): Piece[] {
  const needle = q.trim().toLowerCase();
  const t = topic.trim().toLowerCase();
  return pieces.filter((p) => {
    if (t && !p.topics.includes(t)) return false;
    if (!needle) return true;
    return [p.title, p.summary, p.topics.join(" "), p.body_markdown].some((s) => s.toLowerCase().includes(needle));
  });
}

export function groupByTopic(pieces: Piece[]): [string, Piece[]][] {
  const m = new Map<string, Piece[]>();
  for (const p of pieces) {
    const topics = p.topics.length ? p.topics : ["untagged"];
    for (const t of topics) m.set(t, [...(m.get(t) ?? []), p]);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}
