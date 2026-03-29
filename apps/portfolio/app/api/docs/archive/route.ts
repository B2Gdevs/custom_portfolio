import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { NextResponse } from 'next/server';

import { resolveUnderContentDocs } from '@/lib/server/content-docs-path';

/** Section / nested folder keys only (no traversal). */
const PREFIX_RE = /^[a-zA-Z0-9][a-zA-Z0-9/-]*$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get('prefix')?.trim() ?? '';
  if (!prefix || !PREFIX_RE.test(prefix)) {
    return NextResponse.json({ error: 'Invalid prefix' }, { status: 400 });
  }
  const dirAbs = resolveUnderContentDocs(prefix);
  if (!dirAbs) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  const rootDir = dirAbs;
  try {
    const st = await fs.stat(rootDir);
    if (!st.isDirectory()) {
      return NextResponse.json({ error: 'Not a folder' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const files: { rel: string; full: string }[] = [];

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && (e.name.endsWith('.mdx') || e.name.endsWith('.md'))) {
        const rel = path.relative(rootDir, full).replace(/\\/g, '/');
        files.push({ rel, full });
      }
    }
  }

  await walk(rootDir);
  if (files.length === 0) {
    return NextResponse.json({ error: 'No markdown files in folder' }, { status: 404 });
  }

  const zip = new JSZip();
  for (const { rel, full } of files) {
    zip.file(rel, await fs.readFile(full));
  }
  const buf = Buffer.from(await zip.generateAsync({ type: 'uint8array' }));
  const safeName = prefix.replace(/\//g, '-');
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}.zip"`,
    },
  });
}
