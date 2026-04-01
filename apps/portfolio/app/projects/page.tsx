import { ContentIndexClient } from '@/components/content/ContentIndexClient';
import { toDiscoveryItem } from '@/lib/content-view-models';
import { getProjectEntries } from '@/lib/projects';

export default async function ProjectsPage() {
  const projects = (await getProjectEntries()).map((entry) => toDiscoveryItem('projects', entry));

  return (
    <ContentIndexClient
      kind="projects"
      title="Projects"
      description="Case studies, experiments, and proof-of-work pages with featured ordering, metadata-driven links, and the same search rhythm as the blog."
      items={projects}
    />
  );
}
