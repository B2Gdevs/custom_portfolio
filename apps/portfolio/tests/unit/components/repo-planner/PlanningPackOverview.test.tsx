// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlanningPackOverview, defaultPlanningHostPolicy } from 'repo-planner/host';

describe('PlanningPackOverview', () => {
  it('renders workflow summary cards and host policy badges', () => {
    render(
      <PlanningPackOverview
        kpis={{
          fileCount: 4,
          phaseCount: 2,
          tasksTotal: 6,
          tasksOpen: 4,
          tasksDone: 2,
          tasksOther: 0,
          roadmapPhaseCount: 2,
          stateStatus: 'active',
          referenceCount: 3,
          docFlowCount: 1,
          openQuestionsApprox: 2,
        }}
        workflow={{
          reminder: {
            title: 'Workflow reminder',
            deepLinkPath: 'AGENTS.md',
            readOrder: [],
            rules: [],
          },
          ownership: {
            recommendedScope: 'global',
            label: 'Global / root planning',
            rationale: 'Shared work belongs in global planning.',
            targetFiles: ['AGENTS.md'],
            rules: [],
          },
          sprint: {
            sprintIndex: 0,
            sprintSize: 5,
            phaseIds: ['01', '02'],
            activePhaseCount: 1,
            openPhaseCount: 2,
            progressPercent: 40,
          },
          overview: {
            orphanTasksCount: 0,
            phasesNeedingReviewCount: 1,
            phasesOnlyPlannedCount: 1,
            stalePhasesCount: 1,
            missingTestsCount: 2,
            missingDodCount: 1,
            needsDiscussionCount: 1,
            kickoffRequiredCount: 1,
            doneGateBlockedCount: 1,
          },
          recommendations: [
            {
              phaseId: '02',
              title: 'Structured inspector',
              score: 22,
              action: 'Implement now',
              whyNow: ['High strategic importance'],
              warnings: [],
              kickoff: {
                required: false,
                reasons: [],
                suggestedPath: '.planning/phases/02',
                checklist: [],
              },
              doneGate: {
                ready: false,
                executable: true,
                reasons: ['Tests missing'],
                requiredChecks: ['build', 'lint', 'tests'],
                hasBuildCommand: true,
                hasLintCommand: true,
                hasTestCommand: false,
                openTasksRemaining: 2,
              },
              ownershipGuidance: {
                recommendedScope: 'global',
                label: 'Global / root planning',
                rationale: 'Shared work belongs in global planning.',
                targetFiles: ['AGENTS.md'],
                rules: [],
              },
              progressPercent: 40,
              effortLabel: 'M',
              weightedEffort: 5,
              openQuestions: [],
              answeredQuestions: [],
              openQuestionsCount: 0,
              answeredQuestionsCount: 0,
              missingTests: true,
              missingDod: false,
              blocked: false,
              stale: false,
              ownership: 'global',
              sprintIndex: 0,
              dependentPhaseIds: [],
            },
          ],
        }}
        hostPolicy={defaultPlanningHostPolicy}
      />,
    );

    expect(screen.getByText('Workflow summary')).toBeInTheDocument();
    expect(screen.getByText('Current sprint')).toBeInTheDocument();
    expect(screen.getByText('Top action')).toBeInTheDocument();
    expect(screen.getByText('Implement now')).toBeInTheDocument();
    expect(screen.getByText('Host policy')).toBeInTheDocument();
    expect(screen.getByText('IDs locked')).toBeInTheDocument();
  });
});
