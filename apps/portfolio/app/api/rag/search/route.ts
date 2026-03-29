import { NextResponse } from 'next/server';
import { retrieveRagContext } from '@/lib/rag/retrieve';

function getQueryFromRequest(request: Request, body?: { query?: string }) {
  const url = new URL(request.url);
  return body?.query ?? url.searchParams.get('q') ?? '';
}

export async function GET(request: Request) {
  const query = getQueryFromRequest(request);
  if (!query.trim()) {
    return NextResponse.json({ error: 'missing_query' }, { status: 400 });
  }

  const hits = await retrieveRagContext(query);
  return NextResponse.json({
    query,
    hits,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string };
  const query = getQueryFromRequest(request, body);
  if (!query.trim()) {
    return NextResponse.json({ error: 'missing_query' }, { status: 400 });
  }

  const hits = await retrieveRagContext(query);
  return NextResponse.json({
    query,
    hits,
  });
}
