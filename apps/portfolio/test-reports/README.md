# Generated test reports (`@portfolio/app`)

From the **repo root** (recommended):

```bash
pnpm test:unit:report
```

Or from **`apps/portfolio`**:

```bash
pnpm test:unit:report
```

This runs **Vitest with V8 coverage**, writes:

- **`coverage/index.html`** — line/branch coverage (open in a browser).
- **`coverage/lcov.info`** — for CI and editors.
- **`test-reports/unit/vitest-results.json`** — full Vitest JSON output.
- **`test-reports/unit/environment.json`** — masked `process.env` snapshot at end of run.
- **`test-reports/index.html`** — hub page (React SSR + app Tailwind theme) with summary, pass/fail bar, file table, failures, and links.
- **`test-reports/hub.css`** — compiled Tailwind for that page (regenerated with the hub).

`test-reports/` and `coverage/` are gitignored except this README.

Faster runs without coverage or hub:

```bash
pnpm test:unit
pnpm test:unit:coverage   # coverage only, no hub HTML
```

### Playwright (E2E)

HTML report is produced when tests fail or when configured. After `pnpm test:e2e`:

```bash
pnpm exec playwright show-report
```

From repo root: `pnpm --filter @portfolio/app exec playwright show-report`.
