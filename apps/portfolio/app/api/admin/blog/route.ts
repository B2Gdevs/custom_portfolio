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
    const posts = getAllContent('blog');
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}





