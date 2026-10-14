import TurndownService from "turndown";
import type { Piece } from "./types";
import { normTopic, slugify } from "./slug";

export const HOST = "akarshsabbavarapu09.hashnode.dev";
const GQL = "https://gql.hashnode.com";

const QUERY = `query($host:String!){publication(host:$host){posts(first:50){edges{node{title slug publishedAt url brief tags{name} content{markdown}}}}}}`;

type Fetched = { pieces: Piece[]; via: "graphql" | "rss" };

function toPiece(p: {
  title: string;
  slug: string;
  publishedAt: string;
  url: string;
  markdown: string;
  tags: string[];
  brief: string;
}): Piece {
  return {
    id: `hashnode-${p.slug}`,
    slug: p.slug,
    title: p.title,
    published_at: new Date(p.publishedAt).toISOString(),
    source: "hashnode",
    url: p.url,
    body_markdown: p.markdown,
    topics: Array.from(new Set(p.tags.map(normTopic).filter(Boolean))),
    summary: p.brief,
    sample: false,
  };
}

async function viaGraphql(): Promise<Piece[]> {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { host: HOST } }),
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`graphql ${res.status}`);
  const json = (await res.json()) as {
    data?: { publication?: { posts: { edges: { node: any }[] } } | null };
    errors?: { message: string }[];
  };
  const edges = json.data?.publication?.posts.edges;
  if (!edges) throw new Error(`graphql: ${json.errors?.[0]?.message ?? "no publication"}`);
  return edges.map(({ node }) =>
    toPiece({
      title: node.title,
      slug: node.slug,
      publishedAt: node.publishedAt,
      url: node.url,
      markdown: node.content?.markdown ?? "",
      tags: (node.tags ?? []).map((t: { name: string }) => t.name),
      brief: node.brief ?? "",
    }),
  );
}

function cdata(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return m?.[1]?.trim() ?? "";
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Second route: the publication's RSS feed, with HTML converted to markdown. */
async function viaRss(): Promise<Piece[]> {
  const res = await fetch(`https://${HOST}/rss.xml`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`rss ${res.status}`);
  const xml = await res.text();
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  const items = xml.split("<item>").slice(1);
  if (items.length === 0) throw new Error("rss: no items");
  return items.map((raw) => {
    const item = raw.split("</item>")[0] ?? "";
    const link = cdata(item, "link");
    const html = cdata(item, "content:encoded");
    const tags = Array.from(item.matchAll(/<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g)).map(
      (m) => m[1] ?? "",
    );
    const markdown = td.turndown(html);
    const brief = cdata(item, "description") || stripTags(html).slice(0, 240);
    return toPiece({
      title: cdata(item, "title"),
      slug: link.split("/").filter(Boolean).pop() ?? slugify(cdata(item, "title")),
      publishedAt: cdata(item, "pubDate"),
      url: link,
      markdown,
      tags,
      brief,
    });
  });
}

/** GraphQL first, RSS second. Throws with both reasons if neither works. */
export async function fetchHashnode(): Promise<Fetched> {
  let gqlErr = "";
  try {
    return { pieces: await viaGraphql(), via: "graphql" };
  } catch (e) {
    gqlErr = e instanceof Error ? e.message : String(e);
  }
  try {
    return { pieces: await viaRss(), via: "rss" };
  } catch (e) {
    const rssErr = e instanceof Error ? e.message : String(e);
    throw new Error(`graphql: ${gqlErr}; rss: ${rssErr}`);
  }
}
