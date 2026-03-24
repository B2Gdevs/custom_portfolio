import { promises as fs } from 'node:fs';
import { getResumeBySlug, resolveResumeHtmlPath } from '@/lib/resumes';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
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

  return new Response(html, {
    headers: {
      'content-type': 'application/octet-stream',
      'content-disposition': `attachment; filename="${resume.fileName}"`,
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
