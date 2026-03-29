import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

import { resolveUnderContentDocs } from '@/lib/server/content-docs-path';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug: segments = [] } = await ctx.params;
  if (segments.length === 0) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  if (segments.some((s) => !s || s.includes('..'))) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  const rel = `${segments.join('/')}.mdx`;
  const abs = resolveUnderContentDocs(rel);
  if (!abs) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  let st;
  try {
    st = await fs.stat(abs);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!st.isFile()) {
    return NextResponse.json({ error: 'Not a file' }, { status: 400 });
  }
  const body = await fs.readFile(abs);
  const name = path.basename(abs);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
}
