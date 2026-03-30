import { NextResponse } from 'next/server';
import { buildLivePlanningBundle } from '@/lib/repo-planner/live-bundle';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(buildLivePlanningBundle());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
