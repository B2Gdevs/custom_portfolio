import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import DocsLayout from '@/components/docs/DocsLayout';
import TableOfContents from '@/components/docs/TableOfContents';
import { format } from 'date-fns';
import { Clock, Edit } from 'lucide-react';

export async function generateStaticParams() {
  const docs = getAllContent('docs');
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getContentBySlug('docs', slug);
  const allDocs = getAllContent('docs');

  if (!doc) {
    notFound();
  }

  const components = useMDXComponents({});
  const createdDate = doc.meta.date ? format(new Date(doc.meta.date), 'MMMM d, yyyy') : null;
  const updatedDate = doc.meta.updated ? format(new Date(doc.meta.updated), 'MMMM d, yyyy') : null;

  return (
    <DocsLayout docs={allDocs} currentSlug={slug}>
      <div className="flex gap-8 py-12">
        <article className="flex-1 min-w-0">
          <header className="mb-12 pb-8 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
              {doc.meta.title}
            </h1>
            {doc.meta.description && (
              <p className="text-xl text-text-muted leading-relaxed mb-4">
                {doc.meta.description}
              </p>
            )}
            {(createdDate || updatedDate) && (
              <div className="flex items-center gap-6 text-sm text-text-muted">
                {createdDate && (
                  <div className="flex items-center gap-2">
                    <Edit size={14} />
                    <span>Created: {createdDate}</span>
                  </div>
                )}
                {updatedDate && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Updated: {updatedDate}</span>
                  </div>
                )}
              </div>
            )}
          </header>
          
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <MDXRemote source={doc.content} components={components} options={mdxOptions} />
          </div>
        </article>
        
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}

