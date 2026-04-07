import { ApiDocsPageShell } from '@/components/api-docs/ApiDocsPageShell';
import { ApiDocsRedoc } from '@/components/api-docs/ApiDocsRedoc';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API reference',
  description: 'Interactive OpenAPI documentation for public portfolio HTTP APIs.',
};

export default function DocsApiExplorerPage() {
  return (
    <ApiDocsPageShell>
      <ApiDocsRedoc />
    </ApiDocsPageShell>
  );
}
