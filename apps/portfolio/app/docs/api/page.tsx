import { getAllContent } from '@/lib/content';
import DocsLayout from '@/components/docs/DocsLayout';
import { ApiDocsSwagger } from '@/components/docs/ApiDocsSwagger';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API explorer',
  description: 'Interactive OpenAPI documentation for public portfolio HTTP APIs.',
};

export default function DocsApiExplorerPage() {
  const docs = getAllContent('docs');

  return (
    <DocsLayout docs={docs}>
      <div className="flex flex-col gap-6 px-4 py-10 lg:px-8">
        <header className="max-w-4xl border-b border-border pb-6">
          <p className="section-kicker text-muted-foreground">Documentation</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary md:text-4xl">
            Public API explorer
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-text-muted">
            OpenAPI 3 spec with Swagger UI. Only anonymous and site-session routes are listed; admin,
            owner-only reader uploads, and media generation stay off this surface. Use{' '}
            <strong className="text-foreground">Try it out</strong> against the same origin you loaded
            this page from (local dev or production).
          </p>
        </header>
        <ApiDocsSwagger />
      </div>
    </DocsLayout>
  );
}
