import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getReportsDir } from '@/lib/repo-planner/project-root';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const reportPath = path.join(getReportsDir(), 'latest.md');
    if (!existsSync(reportPath)) {
      return NextResponse.json({ error: 'Report not found', markdown: '' }, { status: 404 });
    }

    const markdown = readFileSync(reportPath, 'utf8');
    return NextResponse.json({ markdown });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message, markdown: '' }, { status: 500 });
  }
}
