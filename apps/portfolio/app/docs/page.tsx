import { getAllContent } from '@/lib/content';
import DocsGrid from '@/components/docs/DocsGrid';
import DocsLayout from '@/components/docs/DocsLayout';
import RecentDocs from '@/components/docs/RecentDocs';

export default function DocsPage() {
  const docs = getAllContent('docs');
  
  // Separate book editor docs
  const bookEditorDocs = docs.filter(doc => doc.slug.startsWith('book-editor/'));
  const otherDocs = docs.filter(doc => !doc.slug.startsWith('book-editor/'));

  return (
    <DocsLayout docs={docs}>
      <div className="flex gap-12 py-12">
        <div className="flex-1 min-w-0 px-4 lg:px-8">
          <div className="mb-12 pb-8 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight tracking-tight">
              Documentation
            </h1>
            <p className="text-lg text-text-muted leading-relaxed mt-4">
              Comprehensive guides, tutorials, and architecture documentation
            </p>
          </div>

          <RecentDocs docs={docs} />

          {bookEditorDocs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-primary mb-6">Book Editor</h2>
              <DocsGrid docs={bookEditorDocs} />
            </section>
          )}

          {otherDocs.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-primary mb-6">General Documentation</h2>
              <DocsGrid docs={otherDocs} />
            </section>
          )}
        </div>
      </div>
    </DocsLayout>
  );
}

