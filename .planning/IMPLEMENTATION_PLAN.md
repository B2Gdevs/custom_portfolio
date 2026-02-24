# Implementation plan (Ralph Wiggum state)

Read this each iteration; pick one task; update after completing.

## Done

- [x] Fix Vercel build: add `onLoadExampleDialogue` and `onLoadExampleFlags` to `DialogueEditorV2` exported props type (packages/dialogue-forge).
- [x] Add AGENTS.md and .planning with Ralph Wiggum loop artifacts.

## Next (optional / when needed)

- [ ] Upgrade Next.js 16.0.8 → 16.1.6 (security; see nextjs.org blog).
- [ ] Resolve Turbopack shiki warning: add `shiki` to app deps or adjust serverExternalPackages if rehype-pretty-code breaks.
- [ ] Peer dep: react-youtube-embed / styled-jsx expect React 15/16; app uses 19 (warning only; fix if runtime issues).
- [ ] pnpm: run `pnpm approve-builds` if native deps (e.g. better-sqlite3, sharp) fail on Vercel.

## In progress

- (none)
