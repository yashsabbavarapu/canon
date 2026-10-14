import type { Piece } from "./types";
import { normTopic, slugify } from "./slug";

const MAX = { title: 200, summary: 600, body: 200_000, topics: 12 };

export type Parsed = { ok: true; piece: Piece } | { ok: false; error: string };

export function parsePieceInput(input: unknown, now = new Date()): Parsed {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Body must be a JSON object." };
  }
  const o = input as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const body = typeof o.body_markdown === "string" ? o.body_markdown : "";
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (!title) return { ok: false, error: "title is required." };
  if (title.length > MAX.title) return { ok: false, error: `title must be ${MAX.title} characters or fewer.` };
  if (!body.trim()) return { ok: false, error: "body_markdown is required." };
  if (body.length > MAX.body) return { ok: false, error: `body_markdown must be ${MAX.body} characters or fewer.` };
  if (summary.length > MAX.summary) return { ok: false, error: `summary must be ${MAX.summary} characters or fewer.` };
  let rawTopics: unknown[];
  if (Array.isArray(o.topics)) rawTopics = o.topics;
  else if (typeof o.topics === "string") rawTopics = o.topics.split(",");
  else if (o.topics === undefined) rawTopics = [];
  else return { ok: false, error: "topics must be an array of strings or a comma-separated string." };
  if (!rawTopics.every((t) => typeof t === "string")) return { ok: false, error: "topics must contain only strings." };
  const topics = Array.from(new Set((rawTopics as string[]).map(normTopic).filter(Boolean)));
  if (topics.length > MAX.topics) return { ok: false, error: `At most ${MAX.topics} topics.` };
  const slug = slugify(title);
  if (!slug) return { ok: false, error: "title must contain letters or digits." };
  return {
    ok: true,
    piece: {
      id: `original-${slug}`,
      slug,
      title,
      published_at: now.toISOString(),
      source: "original",
      body_markdown: body,
      topics,
      summary,
      sample: false,
    },
  };
}
