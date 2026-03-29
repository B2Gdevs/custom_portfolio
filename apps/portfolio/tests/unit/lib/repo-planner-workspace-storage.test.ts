import { parseWorkspaceState, REPO_PLANNER_WORKSPACE_KEY } from '@/lib/repo-planner-workspace-storage';

describe('parseWorkspaceState', () => {
  it('returns default when JSON is invalid', () => {
    const s = parseWorkspaceState('not-json');
    expect(s.activeProjectId).toBe('live');
    expect(s.projects.some((p) => p.id === 'live')).toBe(true);
  });

  it('drops pack projects whose pack payload is invalid instead of throwing', () => {
    const raw = JSON.stringify({
      v: 1,
      activeProjectId: 'pack-bad',
      projects: [
        { id: 'live', kind: 'live', label: 'This repository' },
        { id: 'pack-bad', kind: 'pack', label: 'Bad', packId: 'missing' },
      ],
      packs: {
        wrong: { id: 'x', name: 'n', files: 'not-array' },
      },
    });
    const s = parseWorkspaceState(raw);
    expect(s.projects.every((p) => p.kind !== 'pack' || p.packId in s.packs)).toBe(true);
    expect(s.activeProjectId).toBe('live');
  });

  it('sanitizes pack files and keeps only valid entries', () => {
    const raw = JSON.stringify({
      v: 1,
      activeProjectId: 'live',
      projects: [
        { id: 'live', kind: 'live', label: 'This repository' },
        { id: 'pack-1', kind: 'pack', label: 'P', packId: 'pid' },
      ],
      packs: {
        pid: {
          id: 'pid',
          name: 'Test',
          createdAt: '2026-01-01',
          files: [{ path: 'a.md', content: 'hi' }, { bad: true }, null],
        },
      },
    });
    const s = parseWorkspaceState(raw);
    expect(s.packs.pid?.files).toHaveLength(1);
    expect(s.packs.pid?.files[0]?.path).toBe('a.md');
  });
});

describe('REPO_PLANNER_WORKSPACE_KEY', () => {
  it('is stable for docs and manual QA', () => {
    expect(REPO_PLANNER_WORKSPACE_KEY).toBe('repo-planner-workspace-v1');
  });
});
