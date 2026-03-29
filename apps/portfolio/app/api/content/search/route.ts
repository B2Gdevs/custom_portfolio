import { NextRequest, NextResponse } from 'next/server';
import { getAllContentEntries } from '@/lib/content';
import { searchDiscoveryItems } from '@/lib/content-discovery';
import { toDiscoveryItem } from '@/lib/content-view-models';

export function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  const blogItems = getAllContentEntries('blog').map((entry) => toDiscoveryItem('blog', entry));
  const projectItems = getAllContentEntries('projects').map((entry) => toDiscoveryItem('projects', entry));
  const hits = searchDiscoveryItems([...blogItems, ...projectItems], query, 16);

  return NextResponse.json({
    query,
    hits,
  });
}
