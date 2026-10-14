# Build: Canon v1 (functionality only)

Read FIRST: `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/canon-functional-spec.md` (the contract) and `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/build-conventions.md` (stack, storage, write protection, API norms, acceptance — all binding).

## Build order
1. `lib/hashnode.ts`: fetch the publication `akarshsabbavarapu09.hashnode.dev` via the Hashnode GraphQL API (`https://gql.hashnode.com`, query publication.posts for title, slug, publishedAt, content markdown, tags). If unreachable, fall back to `lib/fallback-pieces.ts` (three known articles: "I built 9 AI systems for GTM teams: here is the architecture", "I read 10 job descriptions, then built what they asked for", "Your AI SDR is inventing facts. I built the audit layer that catches them") and retry the fetch on first request.
2. `lib/store.ts` + seed from the fetched pieces (source "hashnode", canonical URLs kept; all `sample: false` — this is his real writing).
3. API: `POST /api/pieces`, `GET /api/pieces?q=&topic=`.
4. Pages: `/` (pieces grouped by topic, newest first), `/read/[slug]` (clean reading column, safe markdown rendering), `/topics` (index with counts), `/new` (add-piece form), `/log`.

## Notes
- Markdown rendering: use a safe renderer (react-markdown with no raw HTML, or a small sanitizer). No script injection, ever.
- Search is a simple server-side filter over title/summary/topics/body.

## Acceptance
Per build-conventions.md, plus: the three Hashnode articles are present as pieces (or the fallback with a logged retry); add a piece via the form → appears grouped under its topic → search finds it → /read/[slug] renders the markdown. Commit, do NOT push. Report the Vercel setup (new project, KV, CANON_API_SECRET server-only).
