import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ensureArray,
  parseRoadmapXmlString,
  parseStateXmlString,
  parseTaskRegistryXmlString,
  planningXmlParser,
} from '@/lib/planning-parse/planning-parse-core.mjs';
import { buildPlanningWorkflowSnapshot } from '@/lib/planning-parse/planning-workflow.mjs';
import type { PlanningWorkflowSnapshot } from '@/lib/planning-parse/planning-workflow.mjs.d.ts';
import { getProjectRoot, getPrimaryPlanningRoot, readRepoPlannerConfig, resolvePlanningRoots } from '@/lib/repo-planner/project-root';

const AGENT_LOOP_BUNDLE_FORMAT = 'planning-agent-context/1.0';

type RoadmapPhase = NonNullable<ReturnType<typeof parseRoadmapXmlString>>['phases'][number];
type StateModel = NonNullable<ReturnType<typeof parseStateXmlString>>;

export type LivePlanningQuestion = {
  phaseId: string;
  id: string;
  text: string;
  status?: 'open' | 'answered';
  file?: string;
};

export type LivePlanningBundle = {
  format: string;
  role: 'agent-loop-bundle';
  generatedAt: string;
  snapshot: {
    currentPhase: string;
    currentPlan: string;
    status: string;
    nextAction?: string;
    agents?: StateModel['agents'];
  } | null;
  context: {
    sprintIndex: number;
    phaseIds: string[];
    paths: string[];
    phaseIdToTitle: Record<string, string>;
    summary: {
      phases: Array<{
        id: string;
        title: string;
        status: string;
        goal: string;
        tasks: Array<{ id: string; status: string; goal: string; agentId: string }>;
      }>;
      taskCount: number;
    };
    planningRoots: Array<{ id: string; planningDir: string; workspaceRoot: string; discover: boolean }>;
  };
  openTasks: Array<{ id: string; status: string; agentId: string; goal: string; phase: string }>;
  openQuestions: LivePlanningQuestion[];
  agentsWithTasks: Array<{
    agent: { id: string; name: string; phase: string; plan: string; status: string };
    tasks: Array<{ id: string; status: string; goal: string; phase: string; phaseTitle: string }>;
  }>;
  workflow: PlanningWorkflowSnapshot;
};

function readIfExists(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function asText(value: unknown): string {
  return value == null ? '' : String(value);
}

function normalizePhaseId(value: unknown): string {
  const raw = asText(value).trim();
  if (!raw) return '';
  return /^\d+$/.test(raw) ? raw.padStart(2, '0') : raw;
}

function getSprintPhaseIds(roadmapPhases: RoadmapPhase[], sprintSize: number, sprintIndex: number) {
  const start = sprintIndex * sprintSize;
  return roadmapPhases.slice(start, start + sprintSize).map((phase) => phase.id);
}

function getCurrentSprintIndex(roadmap: RoadmapPhase[], state: StateModel | null, sprintSize: number) {
  if (!roadmap.length || !state?.currentPhase) return 0;
  const normalizedCurrentPhase = normalizePhaseId(state.currentPhase);
  const roadmapIndex = roadmap.findIndex((phase) => phase.id === normalizedCurrentPhase);
  return roadmapIndex >= 0 ? Math.floor(roadmapIndex / sprintSize) : 0;
}

function loadPhaseQuestions(projectRoot: string, planningDir: string): LivePlanningQuestion[] {
  const phasesDir = path.join(planningDir, 'phases');
  if (!existsSync(phasesDir)) return [];

  const questions: LivePlanningQuestion[] = [];
  const phaseDirs = readdirSync(phasesDir, { withFileTypes: true });

  for (const phaseDirEntry of phaseDirs) {
    if (!phaseDirEntry.isDirectory()) continue;
    const phaseDirPath = path.join(phasesDir, phaseDirEntry.name);
    const phaseNum = phaseDirEntry.name.match(/^(\d+)-/)?.[1];
    const phaseIdFromDir = phaseNum != null ? phaseNum.padStart(2, '0') : '';
    const files = readdirSync(phaseDirPath, { withFileTypes: true });

    for (const fileEntry of files) {
      if (!fileEntry.isFile() || !fileEntry.name.endsWith('-PLAN.xml')) continue;
      const absolutePath = path.join(phaseDirPath, fileEntry.name);
      const xml = readIfExists(absolutePath);
      if (!xml) continue;

      try {
        const obj = planningXmlParser.parse(xml);
        const plan = obj['phase-plan'] ?? obj;
        const rawQuestions = plan.questions?.question != null ? ensureArray(plan.questions.question) : [];
        const planId = plan.meta?.['phase-id'] ?? fileEntry.name.replace(/-PLAN\.xml$/i, '');
        const phaseId = normalizePhaseId(planId) || phaseIdFromDir || normalizePhaseId(fileEntry.name.replace(/-PLAN\.xml$/i, ''));

        for (const rawQuestion of rawQuestions) {
          const questionRecord =
            rawQuestion && typeof rawQuestion === 'object'
              ? (rawQuestion as Record<string, unknown>)
              : null;
          const status = String(questionRecord?.['@_status'] ?? questionRecord?.status ?? 'open').toLowerCase() === 'answered'
            ? 'answered'
            : 'open';
          const rawText = typeof questionRecord?.['#text'] === 'string' ? questionRecord['#text'] : '';
          const questionText =
            rawText.trim() ||
            (typeof rawQuestion === 'string' ? rawQuestion.trim() : '') ||
            '(no text)';
          questions.push({
            phaseId,
            id: String(questionRecord?.['@_id'] ?? questionRecord?.id ?? ''),
            text: questionText,
            status,
            file: path.relative(projectRoot, absolutePath).replace(/\\/g, '/'),
          });
        }
      } catch {
        // Skip malformed phase plans; live read should stay resilient.
      }
    }
  }

  return questions.sort((left, right) =>
    `${left.phaseId}:${left.id}`.localeCompare(`${right.phaseId}:${right.id}`),
  );
}

export function buildLivePlanningBundle(): LivePlanningBundle {
  const projectRoot = getProjectRoot();
  const config = readRepoPlannerConfig();
  const resolvedRoots = resolvePlanningRoots();
  const primaryRoot = getPrimaryPlanningRoot();
  const planningDir = primaryRoot.planningDir;

  const stateXml = readIfExists(path.join(planningDir, 'STATE.xml'));
  const taskRegistryXml = readIfExists(path.join(planningDir, 'TASK-REGISTRY.xml'));
  const roadmapXml = readIfExists(path.join(planningDir, 'ROADMAP.xml'));

  const state = stateXml ? parseStateXmlString(stateXml) : null;
  const taskRegistry = taskRegistryXml ? parseTaskRegistryXmlString(taskRegistryXml) : null;
  const roadmap = roadmapXml ? parseRoadmapXmlString(roadmapXml)?.phases ?? [] : [];

  const sprintSize =
    typeof config.planning?.sprintSize === 'number' && Number.isFinite(config.planning.sprintSize)
      ? config.planning.sprintSize
      : 5;
  const sprintIndex = getCurrentSprintIndex(roadmap, state, sprintSize);
  const phaseIds = roadmap.length ? getSprintPhaseIds(roadmap, sprintSize, sprintIndex) : [];
  const phaseIdToTitle = Object.fromEntries(roadmap.map((phase) => [phase.id, phase.title || phase.id]));
  const allTasks = taskRegistry?.tasks ?? [];
  const sprintTasks = allTasks.filter((task) => phaseIds.includes(task.phase));
  const openTasks = allTasks
    .filter((task) => task.status !== 'done')
    .map((task) => ({
      id: task.id,
      status: task.status,
      agentId: task.agentId,
      goal: task.goal,
      phase: task.phase,
    }));
  const phaseQuestions = loadPhaseQuestions(projectRoot, planningDir);
  const openQuestions = phaseQuestions.filter((question) => question.status !== 'answered');
  const agentsWithTasks = (state?.agents ?? []).map((agent) => ({
    agent: {
      id: asText(agent.id),
      name: asText(agent.name),
      phase: normalizePhaseId(agent.phase),
      plan: asText(agent.plan),
      status: asText(agent.status),
    },
    tasks: allTasks
      .filter((task) => (task.agentId || '').trim() === asText(agent.id).trim())
      .map((task) => ({
        id: task.id,
        status: task.status,
        goal: task.goal,
        phase: task.phase,
        phaseTitle: phaseIdToTitle[task.phase] || task.phase,
      })),
  }));
  const reviewItems = {
    summary: {
      phasesAtZeroCount: roadmap.filter((phase) => {
        const phaseTasks = allTasks.filter((task) => task.phase === phase.id);
        return phaseTasks.length > 0 && phaseTasks.every((task) => String(task.status).toLowerCase() !== 'done');
      }).length,
      unassignedCount: openTasks.filter((task) => !String(task.agentId ?? '').trim()).length,
      phasesOnlyPlannedCount: roadmap.filter((phase) => {
        const phaseTasks = allTasks.filter((task) => task.phase === phase.id && String(task.status).toLowerCase() !== 'done');
        return phaseTasks.length > 0 && phaseTasks.every((task) => String(task.status).toLowerCase() === 'planned');
      }).length,
    },
  };

  const paths = [
    'STATE.xml',
    'TASK-REGISTRY.xml',
    'ROADMAP.xml',
    'REQUIREMENTS.xml',
    'DECISIONS.xml',
  ]
    .map((fileName) => path.join(planningDir, fileName))
    .filter((absolutePath) => existsSync(absolutePath))
    .map((absolutePath) => path.relative(projectRoot, absolutePath).replace(/\\/g, '/'));

  const phasesDir = path.join(planningDir, 'phases');
  if (existsSync(phasesDir) && phaseIds.length > 0) {
    for (const phaseDirEntry of readdirSync(phasesDir, { withFileTypes: true })) {
      if (!phaseDirEntry.isDirectory()) continue;
      const phaseNum = phaseDirEntry.name.match(/^(\d+)-/)?.[1];
      if (!phaseNum || !phaseIds.includes(phaseNum.padStart(2, '0'))) continue;
      paths.push(path.relative(projectRoot, path.join(phasesDir, phaseDirEntry.name)).replace(/\\/g, '/'));
    }
  }

  return {
    format: AGENT_LOOP_BUNDLE_FORMAT,
    role: 'agent-loop-bundle',
    generatedAt: new Date().toISOString(),
    snapshot: state
      ? {
          currentPhase: normalizePhaseId(state.currentPhase),
          currentPlan: asText(state.currentPlan),
          status: asText(state.status),
          nextAction: asText(state.nextAction),
          agents: state.agents.map((agent) => ({
            ...agent,
            id: asText(agent.id),
            name: asText(agent.name),
            phase: normalizePhaseId(agent.phase),
            plan: asText(agent.plan),
            status: asText(agent.status),
            since: asText(agent.since),
          })),
        }
      : null,
    context: {
      sprintIndex,
      phaseIds,
      paths,
      phaseIdToTitle,
      summary: {
        phases: roadmap
          .filter((phase) => phaseIds.includes(phase.id))
          .map((phase) => ({
            id: phase.id,
            title: phase.title,
            status: phase.status,
            goal: phase.goal ?? '',
            tasks: allTasks
              .filter((task) => task.phase === phase.id)
              .map((task) => ({
                id: task.id,
                status: task.status,
                goal: task.goal,
                agentId: task.agentId,
              })),
          })),
        taskCount: sprintTasks.length,
      },
      planningRoots: resolvedRoots.map((root) => ({
        id: root.id,
        planningDir: path.relative(projectRoot, root.planningDir).replace(/\\/g, '/'),
        workspaceRoot: path.relative(projectRoot, root.workspaceRoot).replace(/\\/g, '/') || '.',
        discover: root.discover,
      })),
    },
    openTasks,
    openQuestions,
    agentsWithTasks,
    workflow: buildPlanningWorkflowSnapshot({
      phases: roadmap
        .filter((phase) => phaseIds.includes(phase.id))
        .map((phase) => ({
          id: phase.id,
          title: phase.title,
          status: phase.status,
          goal: phase.goal ?? '',
          depends: phase.depends ?? '',
          tasks: allTasks
            .filter((task) => task.phase === phase.id)
            .map((task) => ({
              id: task.id,
              status: task.status,
              goal: task.goal,
              agentId: task.agentId,
              commands: task.commands,
            })),
        })),
      taskRows: allTasks.map((task) => ({
        id: task.id,
        status: task.status,
        goal: task.goal,
        agentId: task.agentId,
        phase: task.phase,
        commands: task.commands,
      })),
      roadmapPhases: roadmap.map((phase) => ({
        id: phase.id,
        title: phase.title,
        status: phase.status,
        goal: phase.goal ?? '',
        depends: phase.depends ?? '',
      })),
      openQuestions,
      questionRecords: phaseQuestions,
      currentPhaseId: state?.currentPhase ?? '',
      sprintIndex,
      sprintSize,
      reviewItems,
      ownership: 'global',
      ownershipContext: {
        recommendedScope: 'global',
        label: 'Global / root planning',
        rationale: 'Live mode reads the configured shared planning root, so the default ownership target is the global monorepo planner.',
        targetFiles: ['AGENTS.md', '.planning/ROADMAP.xml', '.planning/STATE.xml', '.planning/TASK-REGISTRY.xml'],
        rules: [
          'Use Global when the phase changes shared tooling, workflow policy, CI, or cross-section architecture.',
          'Split section-local implementation details into a section planner instead of duplicating the full task graph in both places.',
        ],
      },
      policy: {
        kickoffHoursThreshold: 6,
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vendor `.mjs` default import loses `.d.ts` parameter shape in Next/tsc; runtime shape matches `planning-workflow.mjs.d.ts`.
    } as any),
  };
}
