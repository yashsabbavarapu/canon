# Canon

Writing on the GTM engineer craft. Next.js 14, TypeScript, Tailwind.

- Seed: Hashnode GraphQL (`gql.hashnode.com`), then the publication RSS feed, then `lib/fallback-pieces.ts`. Fallback state is retried at most once a minute on later requests; every attempt is in `/log`.
- Writes: `POST /api/pieces`, gated by server-only `CANON_API_SECRET` (`x-canon-secret` header). The /new form posts to `/api/submit`, which adds the secret server-side.
- Storage: `@vercel/kv` when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set, else in memory.
- Tests: `npm test`.
