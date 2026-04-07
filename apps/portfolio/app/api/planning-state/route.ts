import { NextResponse } from 'next/server';
import { jsonApiError, unknownErrorMessage } from '@/lib/api/http';
import { buildLivePlanningBundle } from '@/lib/repo-planner/live-bundle';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(buildLivePlanningBundle());
  } catch (error) {
    return jsonApiError(unknownErrorMessage(error), 500);
  }
}
