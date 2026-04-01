// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanningPackFileTree, type PlanningPackGalleryTab } from 'repo-planner/planning-pack';

describe('PlanningPackFileTree', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['<state />'], { type: 'text/xml' }),
      }),
    );

    URL.createObjectURL = vi.fn(() => 'blob:zip');
    URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('renders pack files in a tree and zips a section on demand', async () => {
    const tabs: PlanningPackGalleryTab[] = [
      {
        id: 'starter-template',
        label: 'Starter template',
        description: 'RepoPlanner init pack for starting a planning tree.',
        mode: 'sections',
        items: [
          {
            id: 'rp-builtin-init:.planning/STATE.xml',
            title: 'STATE',
            file: 'blob:STATE.xml',
            filename: 'STATE.xml',
            archivePath: '.planning/STATE.xml',
            sizeBytes: 8,
            section: 'builtin/rp-builtin-init',
            sectionLabel: 'Init pack (.planning)',
            slug: 'planning-state.xml',
          },
        ],
      },
      {
        id: 'site-planning-packs',
        label: 'This site',
        mode: 'collapsible-sections',
        items: [],
      },
    ];

    render(
      <PlanningPackFileTree
        tabs={tabs}
        loading={false}
        loadError={null}
        tab="starter-template"
        onTab={vi.fn()}
      />,
    );

    expect(screen.getByText('RepoPlanner init pack for starting a planning tree.')).toBeInTheDocument();
    expect(screen.getByText('Init pack (.planning)')).toBeInTheDocument();
    expect(screen.getByText('.planning')).toBeInTheDocument();
    expect(
      screen.getAllByText((_, element) => element?.textContent === 'STATE.xml').length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText('.planning/STATE.xml')).not.toBeInTheDocument();
    expect(screen.getByText('8 B')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Download Init pack (.planning)' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('blob:STATE.xml');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
  });
});
