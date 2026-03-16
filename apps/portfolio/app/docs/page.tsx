import { getAllContent } from '@/lib/content';
import { buildDocSections } from '@/lib/docs';
import DocsGrid from '@/components/docs/DocsGrid';
import DocsLayout from '@/components/docs/DocsLayout';
import RecentDocs from '@/components/docs/RecentDocs';

export default function DocsPage() {
  const docs = getAllContent('docs');
  const sections = buildDocSections(docs);

  return (
    <DocsLayout docs={docs}>
      <div className="flex gap-12 py-12">
        <div className="flex-1 min-w-0 px-4 lg:px-8">
          <div className="mb-12 pb-8 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight tracking-tight">
              Documentation
            </h1>
            <p className="text-lg text-text-muted leading-relaxed mt-4">
              Section-based docs for active workstreams. Each section carries its own implementation notes and planning material.
            </p>
          </div>

          <RecentDocs docs={docs} />

          {sections.map((section) => (
            <section key={section.key} className="mb-12">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-primary">{section.label}</h2>
                  <p className="mt-2 max-w-3xl text-base leading-relaxed text-text-muted">
                    {section.description}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center rounded-full border border-border bg-dark-alt px-3 py-1 text-sm text-text-muted">
                  {section.docs.length} doc{section.docs.length === 1 ? '' : 's'}
                </div>
              </div>
              <DocsGrid docs={section.docs} />
            </section>
          ))}
        </div>
      </div>
    </DocsLayout>
  );
}

