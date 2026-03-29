/**
 * Embedded RepoPlanner cockpit on the portfolio: **default read-only on the server**.
 * - No `planning-edits/apply` (that path persists edits to `.planning/` on disk — used by upstream **AI chat**, not “export from UI”).
 * - No `POST /api/planning-cli/run` (would shell out to `loop-cli.mjs`, which can write reports, usage, etc.).
 *
 * Dashboard tabs that only **GET** parsed state (e.g. `/api/planning-state`) still work against committed `.planning/` or future in-memory/upload packs.
 *
 * Operators who explicitly want server-side CLI / apply (local or gated deploy): set **`PLANNING_COCKPIT_ALLOW_SERVER_WRITES=1`**.
 */
export function planningCockpitServerWritesEnabled(): boolean {
  return process.env.PLANNING_COCKPIT_ALLOW_SERVER_WRITES === '1';
}
