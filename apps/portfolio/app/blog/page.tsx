import { ContentIndexClient } from '@/components/content/ContentIndexClient';
import { getAllContentEntries } from '@/lib/content';
import { toDiscoveryItem } from '@/lib/content-view-models';

export default function BlogPage() {
  const posts = getAllContentEntries('blog').map((entry) => toDiscoveryItem('blog', entry));

  return (
    <ContentIndexClient
      kind="blog"
      title="Blog"
      description="Build notes, architecture essays, and workshop posts with a consistent reading rhythm and a faster archive search surface."
      items={posts}
    />
  );
}
