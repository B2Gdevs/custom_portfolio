import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { runReaderWorkspaceWriteWorker } from '@/lib/reader/workspace-write-worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function applySetCookie(response: NextResponse, setCookie?: string) {
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const title = typeof formData.get('title') === 'string' ? String(formData.get('title')).trim() : '';
  const author =
    typeof formData.get('author') === 'string' ? String(formData.get('author')).trim() : '';
  const description =
    typeof formData.get('description') === 'string'
      ? String(formData.get('description')).trim()
      : '';
  const visibility =
    formData.get('visibility') === 'public' ? 'public' : 'private';

  if (!(file instanceof File) || !title) {
    return NextResponse.json(
      {
        ok: false,
        error: 'file and title are required.',
      },
      { status: 400 },
    );
  }

  if (!file.name.toLowerCase().endsWith('.epub')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Only .epub uploads are supported.',
      },
      { status: 400 },
    );
  }

  const tempDir = path.join(os.tmpdir(), 'portfolio-reader-uploads');
  const tempFilePath = path.join(tempDir, `${randomUUID()}-${sanitizeFileName(file.name)}`);
  await mkdir(tempDir, { recursive: true });
  await writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));

  try {
    const result = await runReaderWorkspaceWriteWorker({
      command: 'upload-epub',
      cookieHeader: request.headers.get('cookie') ?? '',
      input: {
        title,
        author: author || null,
        description: description || null,
        visibility,
        sourceFileName: file.name,
        filePath: tempFilePath,
      },
    });
    const response = NextResponse.json(result.body, { status: result.status });
    applySetCookie(response, result.setCookie);
    return response;
  } finally {
    await unlink(tempFilePath).catch(() => undefined);
  }
}
