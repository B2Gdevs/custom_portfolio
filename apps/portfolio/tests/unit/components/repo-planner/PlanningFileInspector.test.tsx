// @vitest-environment jsdom

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanningFileInspector } from 'repo-planner/host';

describe('PlanningFileInspector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders requirements as structured cards instead of raw markdown', () => {
    render(
      <PlanningFileInspector
        file={{
          path: 'content/docs/repo-planner/requirements.mdx',
          content: `---
title: Requirements
---

## Core Requirements

| Id | Requirement | Why |
| --- | --- | --- |
| \`REQ-01\` | Show structured planning data. | Raw pages are slower to scan. |`,
        }}
        packReadOnly
        onSave={() => {}}
      />,
    );

    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.getByText('Show structured planning data.')).toBeInTheDocument();
    expect(screen.getByText('Host policy')).toBeInTheDocument();
    expect(screen.getByText('Tests required for done')).toBeInTheDocument();
    expect(screen.queryByText(/\| Id \| Requirement \| Why \|/)).not.toBeInTheDocument();
  });

  it('hides raw source for unsupported markdown files', () => {
    render(
      <PlanningFileInspector
        file={{
          path: 'notes/random.md',
          content: '# Raw note\n\nThis should not show as the default cockpit surface.',
        }}
        packReadOnly={false}
        onSave={() => {}}
      />,
    );

    expect(screen.getByText('Raw source is hidden in the normal cockpit surface.')).toBeInTheDocument();
    expect(screen.queryByText('This should not show as the default cockpit surface.')).not.toBeInTheDocument();
  });

  it('debounces autosave for editable markdown state files', () => {
    const onSave = vi.fn();

    render(
      <PlanningFileInspector
        file={{
          path: 'content/docs/repo-planner/planning/state.mdx',
          content: `---
title: State
---

## Registry

| Field | Value |
| --- | --- |
| \`status\` | \`active\` |

## Current cycle

| Field | Value |
| --- | --- |
| \`focus\` | Old focus text |

## Next queue

| Priority | Action |
| --- | --- |
| \`1\` | Keep shipping |

## References

| Id | Path |
| --- | --- |
| \`tool\` | \`apps/repo-planner\` |`,
        }}
        packReadOnly={false}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('Old focus text'), {
      target: { value: 'Updated focus text' },
    });

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]?.[1]).toContain('Updated focus text');
    expect(screen.getByText('Saved locally')).toBeInTheDocument();
  });

  it('shows immutable id guardrails on structured roadmap cards', () => {
    render(
      <PlanningFileInspector
        file={{
          path: 'content/docs/repo-planner/planning/roadmap.mdx',
          content: `---
title: Roadmap
---

## Phases

| Phase | Status | Focus | Next |
| --- | --- | --- | --- |
| \`repo-planner-integration-06\` | \`active\` | Ship structured inspectors. | Finish phase 06. |`,
        }}
        packReadOnly={false}
        onSave={() => {}}
      />,
    );

    expect(screen.getByText('IDs locked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rename ID' })).toBeDisabled();
  });

  it('creates a decision and backfills the phase question reference from the inline composer', () => {
    const onSaveMany = vi.fn();

    render(
      <PlanningFileInspector
        file={{
          path: '.planning/phases/06-phase/06-phase-PLAN.xml',
          content: `<?xml version="1.0" encoding="UTF-8"?>
<phase-plan>
  <meta>
    <phase-id>06</phase-id>
    <phase-name>workflow</phase-name>
  </meta>
  <purpose>Finish workflow editing.</purpose>
  <scope>Structured cockpit work.</scope>
  <questions>
    <question id="q1" status="open">How do we score this?</question>
  </questions>
</phase-plan>`,
        }}
        packReadOnly={false}
        packFiles={[
          {
            path: '.planning/DECISIONS.xml',
            content: `<?xml version="1.0" encoding="UTF-8"?>
<decisions>
</decisions>`,
          },
        ]}
        onSave={() => {}}
        onSaveMany={onSaveMany}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Decision summary for a new answer record'), {
      target: { value: 'Use weighted effort with entropy penalty.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create decision' }));

    expect(onSaveMany).toHaveBeenCalledTimes(1);
    const updates = onSaveMany.mock.calls[0]?.[0] as Array<{ path: string; content: string }>;
    expect(updates).toHaveLength(2);
    expect(updates[0]?.content).toContain('decision-ref="06-how-do-we-score-this-decision"');
    expect(updates[0]?.content).toContain('status="answered"');
    expect(updates[1]?.path).toBe('.planning/DECISIONS.xml');
    expect(updates[1]?.content).toContain('<decision id="06-how-do-we-score-this-decision">');
    expect(screen.getByText(/Answered history \(1\)/)).toBeInTheDocument();
  });

  it('enables pack-only id migration for stable string ids', () => {
    const onSaveMany = vi.fn();

    render(
      <PlanningFileInspector
        file={{
          path: 'content/docs/repo-planner/planning/roadmap.mdx',
          content: `---
title: Roadmap
---

## Phases

| Phase | Status | Focus | Next |
| --- | --- | --- | --- |
| \`repo-planner-integration-06\` | \`active\` | Ship structured inspectors. | Finish phase 06. |`,
        }}
        packReadOnly={false}
        hostPolicy={{ allowPackIdMigration: true }}
        packFiles={[
          {
            path: 'content/docs/repo-planner/planning/roadmap.mdx',
            content: `---
title: Roadmap
---

## Phases

| Phase | Status | Focus | Next |
| --- | --- | --- | --- |
| \`repo-planner-integration-06\` | \`active\` | Ship structured inspectors. | Finish phase 06. |`,
          },
          {
            path: 'content/docs/repo-planner/planning/state.mdx',
            content: 'Current focus: `repo-planner-integration-06`.',
          },
        ]}
        onSave={() => {}}
        onSaveMany={onSaveMany}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rename ID' }));
    fireEvent.change(screen.getByDisplayValue('repo-planner-integration-06'), {
      target: { value: 'repo-planner-integration-06b' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply migration' }));

    expect(onSaveMany).toHaveBeenCalledTimes(1);
    const updates = onSaveMany.mock.calls[0]?.[0] as Array<{ path: string; content: string }>;
    expect(updates).toHaveLength(2);
    expect(updates[0]?.content).toContain('repo-planner-integration-06b');
    expect(updates[1]?.content).toContain('repo-planner-integration-06b');
  });
});
