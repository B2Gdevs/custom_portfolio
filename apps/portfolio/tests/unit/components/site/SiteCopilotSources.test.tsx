// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { SiteCopilotSources } from '@/components/site/SiteCopilotSources';

describe('SiteCopilotSources', () => {
  it('renders a collapsible sources panel with anchored links', () => {
    render(
      <SiteCopilotSources
        bundle={{
          query: 'Who is Morgana?',
          hits: [
            {
              chunkId: 1,
              sourceId: 'docs:magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
              sourceKind: 'magicborn',
              sourceScope: 'magicborn',
              title: 'Morgana, the Sleeping Root',
              heading: 'Known Facts',
              anchor: 'known-facts',
              publicUrl: '/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
              sourcePath: 'apps/portfolio/content/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root.mdx',
              content: 'Morgana powers relics.',
              snippet: 'Morgana powers relics.',
              distance: 0.2,
              score: 0.9,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Sources (1)')).toBeInTheDocument();
    expect(screen.getByText('Query: Who is Morgana?')).toBeInTheDocument();
    expect(screen.getByText('Morgana, the Sleeping Root')).toBeInTheDocument();
    expect(screen.getByText('Morgana powers relics.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open source' })).toHaveAttribute(
      'href',
      '/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root#known-facts',
    );
  });

  it('renders a loading state while lookup is in progress', () => {
    render(<SiteCopilotSources isLoading />);

    expect(screen.getByText('Looking up sources...')).toBeInTheDocument();
  });
});
