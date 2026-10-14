import test from "node:test";
import assert from "node:assert/strict";
import { parsePieceInput } from "./validate";
import { rateLimit } from "./rate-limit";
import { filterPieces, groupByTopic } from "./store";
import { slugify } from "./slug";

test("slugify", () => assert.equal(slugify("Hello, World & Co!"), "hello-world-and-co"));

test("validation", () => {
  assert.equal(parsePieceInput({ title: "", body_markdown: "x" }).ok, false);
  assert.equal(parsePieceInput({ title: "a", body_markdown: "x", topics: [1] }).ok, false);
  const r = parsePieceInput({ title: "A Title", body_markdown: "x", topics: "GTM, gtm , AI" });
  assert.ok(r.ok && r.piece.topics.join() === "gtm,ai" && r.piece.slug === "a-title");
});

test("rate limit", () => {
  for (let i = 0; i < 30; i++) assert.equal(rateLimit("t", 1000), 0);
  assert.ok(rateLimit("t", 1001) > 0);
  assert.equal(rateLimit("t", 1000 + 61_000), 0);
});

test("filter and group", () => {
  const mk = (slug: string, topics: string[], body = "") => ({
    id: slug, slug, title: slug, published_at: "2026-01-01T00:00:00Z", source: "original" as const,
    body_markdown: body, topics, summary: "", sample: false,
  });
  const ps = [mk("a", ["x", "y"], "needle"), mk("b", ["x"])];
  assert.equal(filterPieces(ps, "needle", "").length, 1);
  assert.equal(filterPieces(ps, "", "y").length, 1);
  assert.equal(groupByTopic(ps)[0]?.[0], "x");
});
