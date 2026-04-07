import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { unknownErrorMessage } from '@/lib/api/http';
import { planningCockpitServerWritesEnabled } from '@/lib/repo-planner/cockpit-server-policy';
import { getPlanningDir, getProjectRoot } from '@/lib/repo-planner/project-root';

export const runtime = 'nodejs';

const ApplySchema = z.object({
  edits: z
    .array(
      z.object({
        path: z.string().min(1).max(500),
        newContent: z.string().max(500_000),
      }),
    )
    .max(20),
});

function resolvePlanningPath(relativePath: string, planningDir: string, root: string): string | null {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  if (normalized.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  const planningDirRelative = path.relative(root, planningDir).replace(/\\/g, '/');
  const prefixedPath = planningDirRelative ? `${planningDirRelative}/` : '';
  const base = normalized.startsWith(prefixedPath) ? normalized : `${prefixedPath}${normalized}`;
  const absolute = path.join(root, base);
  const relative = path.relative(planningDir, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }

  return absolute;
}

export async function POST(request: Request) {
  if (!planningCockpitServerWritesEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Server-side planning file writes are disabled for the embedded cockpit (portfolio default). This route is for upstream AI chat applying edits to disk — not the export-only workflow. Set PLANNING_COCKPIT_ALLOW_SERVER_WRITES=1 to enable (operators only).',
      },
      { status: 403 },
    );
  }

  try {
    const body = ApplySchema.parse(await request.json());
    const root = getProjectRoot();
    const planningDir = getPlanningDir();
    const applied: string[] = [];

    for (const edit of body.edits) {
      const absolutePath = resolvePlanningPath(edit.path, planningDir, root);
      if (!absolutePath) {
        return NextResponse.json({ ok: false, error: `Invalid path: ${edit.path}` }, { status: 400 });
      }

      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, edit.newContent, 'utf8');
      applied.push(path.relative(root, absolutePath).replace(/\\/g, '/'));
    }

    return NextResponse.json({ ok: true, applied });
  } catch (error) {
    return NextResponse.json({ ok: false, error: unknownErrorMessage(error) }, { status: 400 });
  }
}
