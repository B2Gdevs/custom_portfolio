# Local log sink (optional)

**App logging (JSON lines, rotation):** set in repo `.env`:

- `LOG_FILE_ENABLED=1`
- `LOG_FILE_PATH=./.logs/portfolio-server.log` (resolved from the process working directory, usually the monorepo root when you run `pnpm dev`)

**Files like `.next-dev-3102.log` in the repo root** are not written by this app. They come from **shell redirection or editor tasks** that tee Next’s stdout/stderr to files (the numbers are usually PIDs). Use this folder for intentional sinks; ignore or delete ad-hoc dotfiles in the root.
