import type { Piece } from "./types";

const HOST = "https://akarshsabbavarapu09.hashnode.dev";

/**
 * The three known articles, used when the live publication cannot be read.
 * Bodies here are pointers, not copies: the full text is fetched from the
 * publication on the first request that can reach it.
 */
export const FALLBACK_PIECES: Piece[] = [
  {
    id: "hashnode-i-built-9-ai-systems-for-gtm-teams-here-is-the-architecture",
    slug: "i-built-9-ai-systems-for-gtm-teams-here-is-the-architecture",
    title: "I built 9 AI systems for GTM teams: here is the architecture",
    published_at: "2026-10-10T21:16:47.000Z",
    source: "hashnode",
    url: `${HOST}/i-built-9-ai-systems-for-gtm-teams-here-is-the-architecture`,
    body_markdown: `The full text of this piece lives on the publication: ${HOST}/i-built-9-ai-systems-for-gtm-teams-here-is-the-architecture`,
    topics: ["gtm", "ai", "engineering"],
    summary: "The architecture behind nine AI systems built for GTM teams.",
    sample: false,
  },
  {
    id: "hashnode-i-read-10-job-descriptions-then-built-what-they-asked-for",
    slug: "i-read-10-job-descriptions-then-built-what-they-asked-for",
    title: "I read 10 job descriptions, then built what they asked for",
    published_at: "2026-10-12T13:37:20.000Z",
    source: "hashnode",
    url: `${HOST}/i-read-10-job-descriptions-then-built-what-they-asked-for`,
    body_markdown: `The full text of this piece lives on the publication: ${HOST}/i-read-10-job-descriptions-then-built-what-they-asked-for`,
    topics: ["gtm", "ai", "engineering"],
    summary: "A gap analysis of ten real job postings, and what was built from it.",
    sample: false,
  },
  {
    id: "hashnode-your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them",
    slug: "your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them",
    title: "Your AI SDR is inventing facts. I built the audit layer that catches them",
    published_at: "2026-10-13T00:00:00.000Z",
    source: "hashnode",
    url: `${HOST}/your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them`,
    body_markdown: `The full text of this piece lives on the publication: ${HOST}/your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them`,
    topics: ["gtm", "ai", "audit"],
    summary: "An audit layer that checks AI SDR output for invented facts.",
    sample: false,
  },
];
