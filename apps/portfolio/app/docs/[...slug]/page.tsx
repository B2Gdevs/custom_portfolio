import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import DocsLayout from '@/components/docs/DocsLayout';
import TableOfContents from '@/components/docs/TableOfContents';
import { format } from 'date-fns';
import { Clock, Edit } from 'lucide-react';

/** No `generateStaticParams` — avoid prerendering hundreds of MDX pages during `next build` (timeouts). */
export const dynamic = 'force-dynamic';

/** Single catch-all for `/docs/a` and `/docs/a/b/...` (replaces duplicate `[slug]` route). */
export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = Array.isArray(slug) ? slug.join('/') : String(slug);
  const doc = getContentBySlug('docs', slugString);
  const allDocs = getAllContent('docs');

  if (!doc) {
    notFound();
  }

  const components = getMDXComponents({});
  const createdDate = doc.meta.date ? format(new Date(doc.meta.date), 'MMMM d, yyyy') : null;
  const updatedDate = doc.meta.updated ? format(new Date(doc.meta.updated), 'MMMM d, yyyy') : null;

  return (
    <DocsLayout docs={allDocs}>
      <div className="flex gap-8 py-12">
        <article className="min-w-0 flex-1">
          <header className="mb-12 border-b border-border pb-8">
            <h1 className="mb-4 text-4xl font-bold leading-tight text-primary md:text-5xl">{doc.meta.title}</h1>
            {doc.meta.description ? (
              <p className="mb-4 text-xl leading-relaxed text-text-muted">{doc.meta.description}</p>
            ) : null}
            {createdDate || updatedDate ? (
              <div className="flex items-center gap-6 text-sm text-text-muted">
                {createdDate ? (
                  <div className="flex items-center gap-2">
                    <Edit size={14} aria-hidden />
                    <span>Created: {createdDate}</span>
                  </div>
                ) : null}
                {updatedDate ? (
                  <div className="flex items-center gap-2">
                    <Clock size={14} aria-hidden />
                    <span>Updated: {updatedDate}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          <div className="prose prose-lg max-w-none prose-slate dark:prose-invert">
            <MDXRemote source={doc.content} components={components} options={mdxOptions} />
          </div>
        </article>

        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}
