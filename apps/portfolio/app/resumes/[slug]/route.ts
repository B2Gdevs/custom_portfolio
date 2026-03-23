import { promises as fs } from 'node:fs';
import { getResumeBySlug, resolveResumeHtmlPath } from '@/lib/resumes';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const resume = getResumeBySlug(slug);

  if (!resume) {
    return new Response('Resume not found.', { status: 404 });
  }

  const htmlPath = resolveResumeHtmlPath(resume.fileName);

  if (!htmlPath) {
    return new Response('Resume source file is missing.', { status: 500 });
  }

  const html = await fs.readFile(htmlPath, 'utf8');
  const shouldDownload = new URL(request.url).searchParams.get('download') === '1';

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      ...(shouldDownload
        ? {
            'content-disposition': `attachment; filename="${resume.fileName}"`,
          }
        : {}),
    },
  });
}
