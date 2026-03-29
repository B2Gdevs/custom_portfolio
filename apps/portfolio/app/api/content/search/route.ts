import { NextRequest, NextResponse } from 'next/server';
import { getAllContentEntries } from '@/lib/content';
import { searchDiscoveryItems } from '@/lib/content-discovery';
import { toDiscoveryItem } from '@/lib/content-view-models';
import { getListenSearchDiscoveryItems } from '@/lib/listen-search';

export function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  const trimmed = query.trim();

  if (!trimmed) {
    return NextResponse.json({
      query,
      hits: [],
    });
  }

  const blogItems = getAllContentEntries('blog').map((entry) => toDiscoveryItem('blog', entry));
  const projectItems = getAllContentEntries('projects').map((entry) => toDiscoveryItem('projects', entry));
  const listenItems = getListenSearchDiscoveryItems();
  const hits = searchDiscoveryItems([...blogItems, ...projectItems, ...listenItems], trimmed, 20);

  return NextResponse.json({
    query: trimmed,
    hits,
  });
}
