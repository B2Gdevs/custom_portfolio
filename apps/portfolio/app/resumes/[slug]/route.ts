import { promises as fs } from 'node:fs';
import { isResumeOwnerRequest } from '@/lib/auth/resume-owner-gate';
import { getResumeBySlug, resolveResumeHtmlPath } from '@/lib/resumes';
import { findSiteDownloadAssets, pickResumeHtmlAsset, resolveSiteDownloadAssetUrl } from '@/lib/site-download-assets';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isResumeOwnerRequest(request))) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const { slug } = await params;
  const resume = await getResumeBySlug(slug);

  if (!resume) {
    return new Response('Resume not found.', { status: 404 });
  }

  const assets = await findSiteDownloadAssets({
    downloadKind: 'resume',
    contentScope: 'resume',
    contentSlug: resume.slug,
  });
  const htmlAsset = pickResumeHtmlAsset(assets);
  const shouldDownload = new URL(request.url).searchParams.get('download') === '1';

  if (htmlAsset) {
    const assetUrl = resolveSiteDownloadAssetUrl(htmlAsset);
    if (assetUrl) {
      const assetResponse = await fetch(new URL(assetUrl, request.url), {
        cache: 'no-store',
      }).catch(() => null);

      if (assetResponse?.ok) {
        const html = await assetResponse.text();

        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=0, must-revalidate',
            ...(shouldDownload
              ? {
                  'content-disposition': `attachment; filename="${htmlAsset.filename ?? resume.fileName}"`,
                }
              : {}),
          },
        });
      }
    }
  }

  const htmlPath = resolveResumeHtmlPath(resume.fileName);

  if (!htmlPath) {
    return new Response('Resume source file is missing.', { status: 500 });
  }

  const html = await fs.readFile(htmlPath, 'utf8');

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
