import { NextResponse } from 'next/server';
import { getAllContent } from '@/lib/content';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const posts = getAllContent('blog');
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}




