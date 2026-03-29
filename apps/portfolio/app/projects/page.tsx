import { ContentIndexClient } from '@/components/content/ContentIndexClient';
import { getAllContentEntries } from '@/lib/content';
import { toDiscoveryItem } from '@/lib/content-view-models';

export default function ProjectsPage() {
  const projects = getAllContentEntries('projects').map((entry) => toDiscoveryItem('projects', entry));

  return (
    <ContentIndexClient
      kind="projects"
      title="Projects"
      description="Case studies, experiments, and proof-of-work pages with featured ordering, metadata-driven links, and the same search rhythm as the blog."
      items={projects}
    />
  );
}
