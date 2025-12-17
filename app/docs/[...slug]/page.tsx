import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import DocsLayout from '@/components/docs/DocsLayout';
import TableOfContents from '@/components/docs/TableOfContents';
import { format } from 'date-fns';

export async function generateStaticParams() {
  const docs = getAllContent('docs');
  return docs.map((doc) => ({
    slug: doc.slug.split('/'), // Convert "book-editor/overview" to ["book-editor", "overview"]
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = Array.isArray(slug) ? slug.join('/') : slug; // Convert array back to string
  const doc = getContentBySlug('docs', slugString);
  const allDocs = getAllContent('docs');

  if (!doc) {
    notFound();
  }

  const components = useMDXComponents({});

  return (
    <DocsLayout docs={allDocs} currentSlug={slugString}>
      <div className="flex gap-12 py-12">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <header className="mb-8 pb-6 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3 leading-tight tracking-tight">
              {doc.meta.title}
            </h1>
            {doc.meta.description && (
              <p className="text-lg text-text-muted leading-relaxed mt-4">
                {doc.meta.description}
              </p>
            )}
          </header>
          
          <div className="prose prose-invert max-w-none">
            <MDXRemote source={doc.content} components={components} options={mdxOptions} />
          </div>
        </article>
        
        {/* Right Sidebar - TOC */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 pt-12">
            <TableOfContents />
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}

