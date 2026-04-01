import { NextResponse } from 'next/server';
import { getAllContent } from '@/lib/content';
import {
  adminUnauthorizedResponse,
  isAdminOwnerRequest,
} from '@/lib/auth/admin-owner-gate';

export async function GET(request: Request) {
  if (!(await isAdminOwnerRequest(request))) {
    return adminUnauthorizedResponse();
  }

  try {
    const docs = getAllContent('docs');
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
  }
}





