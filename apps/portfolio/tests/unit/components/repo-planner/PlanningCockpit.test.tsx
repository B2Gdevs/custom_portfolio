// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlanningCockpit, type PlanningCockpitDataSource } from 'repo-planner';

function createDataSource(): PlanningCockpitDataSource {
  return {
    kind: 'pack',
    badgeLabel: 'Pack',
    supportsTerminal: false,
    supportsTestsTab: false,
    supportsChat: false,
    supportsHistoricalMetrics: false,
    emptyMetricsMessage: 'No metrics.',
    emptyReportMessage: 'No report.',
    async getBundle() {
      return {
        snapshot: {
          currentPhase: '01',
          currentPlan: 'repo-planner-integration-05',
          status: 'active',
          nextAction: 'Discuss the scoring UX.',
          agents: [],
        },
        openTasks: [
          {
            id: '01-01',
            status: 'in-progress',
            agentId: 'agent-1',
            goal: 'Ship the workflow lane.',
            phase: '01',
          },
        ],
        openQuestions: [
          {
            phaseId: '02',
            id: 'q-1',
            text: 'How should the score be displayed?',
          },
        ],
        context: {
          sprintIndex: 0,
          phaseIds: ['01', '02'],
          summary: {
            phases: [
              {
                id: '01',
                title: 'Workflow lane',
                status: 'active',
                goal: 'Ship the cockpit workflow surface.',
                tasks: [
                  {
                    id: '01-01',
                    status: 'in-progress',
                    goal: 'Ship the workflow lane.',
                    agentId: 'agent-1',
                  },
                ],
              },
            ],
            taskCount: 1,
          },
        },
        agentsWithTasks: [],
        workflow: {
          reminder: {
            title: 'Workflow reminder',
            deepLinkPath: 'AGENTS.md',
            readOrder: ['Read AGENTS.md first.', 'Read the planning records for the scope you are changing.'],
            rules: ['Kickoff is required when a phase is vague, stale, or estimated hours exceed policy max.'],
          },
          ownership: {
            recommendedScope: 'global',
            label: 'Global / root planning',
            rationale: 'Shared workflow work belongs in the root planner.',
            targetFiles: ['AGENTS.md', '.planning/ROADMAP.xml'],
            rules: ['Use Global when the work changes shared workflow policy.'],
          },
          sprint: {
            sprintIndex: 0,
            sprintSize: 5,
            phaseIds: ['01', '02'],
            activePhaseCount: 1,
            openPhaseCount: 2,
            progressPercent: 50,
          },
          overview: {
            orphanTasksCount: 0,
            phasesNeedingReviewCount: 0,
            phasesOnlyPlannedCount: 1,
            stalePhasesCount: 0,
            missingTestsCount: 1,
            missingDodCount: 0,
            needsDiscussionCount: 1,
            kickoffRequiredCount: 1,
            doneGateBlockedCount: 1,
          },
          recommendations: [
            {
              phaseId: '02',
              title: 'Question UX',
              score: 18.3,
              action: 'Discuss first',
              whyNow: ['In the current sprint window'],
              warnings: ['Needs discussion'],
              kickoff: {
                required: true,
                reasons: ['Open questions still need discussion'],
                suggestedPath: '.planning/phases/02/',
                checklist: ['goal', 'scope'],
              },
              doneGate: {
                ready: false,
                executable: true,
                reasons: ['Tests are missing from the verification path'],
                requiredChecks: ['build', 'lint', 'tests', 'planning updates'],
                hasBuildCommand: true,
                hasLintCommand: false,
                hasTestCommand: false,
                openTasksRemaining: 1,
              },
              ownershipGuidance: {
                recommendedScope: 'global',
                label: 'Global / root planning',
                rationale: 'Shared workflow work belongs in the root planner.',
                targetFiles: ['AGENTS.md', '.planning/ROADMAP.xml'],
                rules: ['Use Global when the work changes shared workflow policy.'],
              },
              progressPercent: 0,
              effortLabel: 'S',
              weightedEffort: 1,
              openQuestions: ['How should the score be displayed?'],
              answeredQuestions: ['Decision recorded for card layout.'],
              openQuestionsCount: 1,
              answeredQuestionsCount: 1,
              missingTests: true,
              missingDod: false,
              blocked: false,
              stale: false,
              ownership: 'global',
              sprintIndex: 0,
              dependentPhaseIds: [],
            },
          ],
        },
      };
    },
    async getMetrics() {
      return { metrics: [], usage: [] };
    },
    async getLatestReport() {
      return '';
    },
  };
}

describe('PlanningCockpit workflow lane', () => {
  it('renders workflow recommendation, ownership, and answered history from the shared bundle', async () => {
    render(<PlanningCockpit dataSource={createDataSource()} />);

    expect(await screen.findByText('Workflow Reminder')).toBeInTheDocument();
    expect(screen.getByText('Ownership Guidance')).toBeInTheDocument();
    expect(screen.getByText('Recommended phases')).toBeInTheDocument();
    expect(screen.getByText('Discuss first')).toBeInTheDocument();
    expect(screen.getByText(/Answered history \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Shared workflow work belongs in the root planner.')).toBeInTheDocument();
  });
});
