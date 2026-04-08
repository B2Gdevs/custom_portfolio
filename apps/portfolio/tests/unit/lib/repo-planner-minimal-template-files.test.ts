import { getMinimalPlanningTemplateFiles } from '@/lib/repo-planner/minimal-template-files';

describe('getMinimalPlanningTemplateFiles', () => {
  it('returns the expected minimal init files', () => {
    const files = getMinimalPlanningTemplateFiles();
    const paths = files.map((file) => file.path);

    expect(paths).toContain('REQUIREMENTS.md');
    expect(paths).toContain('.planning/AGENTS.md');
    expect(paths).toContain('.planning/gad-config.toml');
    expect(paths).toContain('.planning/STATE.xml');
    expect(paths).toContain('.planning/TASK-REGISTRY.xml');
    expect(paths).toContain('.planning/ROADMAP.xml');
    expect(paths).toContain('.planning/DECISIONS.xml');
    expect(paths).toContain('.planning/ERRORS-AND-ATTEMPTS.xml');
    expect(paths).toContain('.planning/REQUIREMENTS.xml');
  });
});
