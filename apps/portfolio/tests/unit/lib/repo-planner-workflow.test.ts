import { describe, expect, it } from 'vitest';
import { buildPlanningWorkflowSnapshot } from '@/lib/repo-planner-workflow';

describe('buildPlanningWorkflowSnapshot', () => {
  it('ranks sprint phases, lowers implementation recommendation for entropy, and emits reminder data', () => {
    const workflow = buildPlanningWorkflowSnapshot({
      phases: [
        {
          id: '01',
          title: 'Current phase',
          status: 'active',
          goal: 'Ship the scoring engine.',
          depends: '',
          tasks: [
            {
              id: '01-01',
              status: 'in-progress',
              goal: 'Implement the engine.',
              agentId: 'agent-1',
              commands: ['pnpm run build'],
            },
          ],
        },
        {
          id: '02',
          title: 'Ambiguous phase',
          status: 'planned',
          goal: 'Decide the exact UI behavior.',
          depends: '01',
          tasks: [
            {
              id: '02-01',
              status: 'planned',
              goal: 'Refine open questions.',
              agentId: '',
              commands: ['pnpm run build'],
            },
          ],
        },
        {
          id: '03',
          title: 'Blocked follow-up',
          status: 'blocked',
          goal: 'Wait on prior decision.',
          depends: '02',
          tasks: [
            {
              id: '03-01',
              status: 'blocked',
              goal: 'Cannot start yet.',
              agentId: '',
              commands: ['pnpm run build'],
            },
          ],
        },
      ],
      taskRows: [
        {
          id: '01-01',
          status: 'in-progress',
          goal: 'Implement the engine.',
          agentId: 'agent-1',
          phase: '01',
          commands: ['pnpm run build'],
        },
        {
          id: '02-01',
          status: 'planned',
          goal: 'Refine open questions.',
          agentId: '',
          phase: '02',
          commands: ['pnpm run build'],
        },
        {
          id: '03-01',
          status: 'blocked',
          goal: 'Cannot start yet.',
          agentId: '',
          phase: '03',
          commands: ['pnpm run build'],
        },
      ],
      roadmapPhases: [
        { id: '01', title: 'Current phase', status: 'active', goal: 'Ship the scoring engine.', depends: '' },
        { id: '02', title: 'Ambiguous phase', status: 'planned', goal: 'Decide the exact UI behavior.', depends: '01' },
        { id: '03', title: 'Blocked follow-up', status: 'blocked', goal: 'Wait on prior decision.', depends: '02' },
      ],
      openQuestions: [
        { phaseId: '02', id: 'q-1', text: 'How should the score be shown?' },
        { phaseId: '02', id: 'q-2', text: 'What should the action labels be?' },
      ],
      questionRecords: [
        { phaseId: '02', id: 'q-1', text: 'How should the score be shown?', status: 'open' },
        { phaseId: '02', id: 'q-2', text: 'What should the action labels be?', status: 'open' },
        { phaseId: '02', id: 'q-3', text: 'Decision recorded for card layout.', status: 'answered' },
      ],
      currentPhaseId: '01',
      sprintIndex: 0,
      sprintSize: 5,
      reviewItems: {
        summary: {
          phasesAtZeroCount: 2,
          unassignedCount: 2,
          phasesOnlyPlannedCount: 1,
        },
      },
      ownership: 'global',
      ownershipContext: {
        recommendedScope: 'global',
        label: 'Global / root planning',
        rationale: 'Shared workflow work belongs in the root planner.',
        targetFiles: ['AGENTS.md', '.planning/ROADMAP.xml'],
        rules: ['Use Global when the work changes shared workflow policy.'],
      },
    });

    expect(workflow.reminder.deepLinkPath).toBe('AGENTS.md');
    expect(workflow.ownership.label).toBe('Global / root planning');
    expect(workflow.sprint.phaseIds).toEqual(['01', '02', '03']);
    expect(workflow.overview.needsDiscussionCount).toBe(1);
    expect(workflow.overview.kickoffRequiredCount).toBe(2);
    expect(workflow.overview.doneGateBlockedCount).toBe(3);
    expect(workflow.recommendations[0]).toMatchObject({
      phaseId: '01',
      action: 'Implement now',
      missingTests: true,
      effortLabel: 'S',
    });
    expect(workflow.recommendations[0]?.doneGate.ready).toBe(false);
    expect(workflow.recommendations[1]).toMatchObject({
      phaseId: '02',
      action: 'Discuss first',
      openQuestionsCount: 2,
    });
    expect(workflow.recommendations[1]?.kickoff.required).toBe(true);
    expect(workflow.recommendations[1]?.answeredQuestionsCount).toBe(1);
    expect(workflow.recommendations[1]?.answeredQuestions).toContain('Decision recorded for card layout.');
    expect(workflow.recommendations[1]?.ownershipGuidance.targetFiles).toContain('AGENTS.md');
    expect(workflow.recommendations[2]).toMatchObject({
      phaseId: '03',
      action: 'Unblock dependency',
      blocked: true,
    });
  });
});
