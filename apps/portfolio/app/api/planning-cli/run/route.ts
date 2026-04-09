import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const REMOVED_MESSAGE =
  'In-browser planning CLI was removed. Run GAD locally: `node vendor/get-anything-done/bin/gad.cjs snapshot --projectid <id>` (or your workspace wrapper). The `vendor/repo-planner` submodule stays archived in-tree only; it is not invoked by this app.';

/** @deprecated Always 501 — portfolio no longer spawns RepoPlanner loop-cli. */
export async function POST() {
  return NextResponse.json(
    { ok: false, error: REMOVED_MESSAGE, stdout: '', stderr: '' },
    { status: 501 },
  );
}
