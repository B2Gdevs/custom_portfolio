// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';

vi.mock('repo-planner', () => ({
  PlanningCockpit: () => <div data-testid="planning-cockpit">Planning cockpit</div>,
}));

vi.mock('repo-planner/host', () => ({
  defaultPlanningHostPolicy: {
    testsRequiredForDone: true,
    globalReadOrderFirst: true,
    sprintSize: 5,
    kickoffHoursThreshold: 6,
    hideRawSourceInInspector: true,
    immutableIds: true,
    allowPackIdMigration: false,
  },
  builtinEmbedPackToPlanningPack: (pack: { id: string; name: string; files?: unknown[] }) => ({
    id: pack.id,
    name: pack.name,
    files: pack.files ?? [],
  }),
  RepoPlannerWorkspaceShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="workspace-shell">{children}</div>
  ),
  PlanningCockpitDashboard: ({
    livePane,
    builtinPacks,
  }: {
    livePane: React.ReactNode;
    builtinPacks?: Array<{ id: string }>;
  }) => (
    <div>
      <div data-testid="live-pane">{livePane}</div>
      <div data-testid="builtin-pack-count">{builtinPacks?.length ?? 0}</div>
    </div>
  ),
}));

describe('RepoPlannerCockpitClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ packs: [] }),
      }),
    );
  });

  it('mounts the real planning cockpit as the live pane inside the workspace shell', async () => {
    render(<RepoPlannerCockpitClient />);

    expect(screen.getByTestId('workspace-shell')).toBeInTheDocument();
    expect(await screen.findByTestId('planning-cockpit')).toBeInTheDocument();
    expect(screen.getByTestId('live-pane')).toHaveTextContent('Planning cockpit');
    expect(screen.getByTestId('builtin-pack-count')).toHaveTextContent('0');
  });

  it('does not fetch site builtin packs when loadSiteBuiltinPacks is false', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<RepoPlannerCockpitClient loadSiteBuiltinPacks={false} />);

    expect(await screen.findByTestId('planning-cockpit')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('builtin-pack-count')).toHaveTextContent('0');
  });
});
