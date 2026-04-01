import { NextResponse } from 'next/server';
import {
  adminUnauthorizedResponse,
  isAdminOwnerRequest,
} from '@/lib/auth/admin-owner-gate';
import { getProjectSummaries } from '@/lib/projects';

export async function GET(request: Request) {
  if (!(await isAdminOwnerRequest(request))) {
    return adminUnauthorizedResponse();
  }

  try {
    const projects = await getProjectSummaries();
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}





