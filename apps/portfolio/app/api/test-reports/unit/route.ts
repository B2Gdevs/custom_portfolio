import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { unknownErrorMessage } from '@/lib/api/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getProjectRoot(): string {
  const raw = process.env.REPOPLANNER_PROJECT_ROOT || process.cwd();
  return path.resolve(process.cwd(), raw);
}

type AssertionResult = {
  fullName: string;
  title: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  duration?: number;
  failureMessages?: string[];
  ancestorTitles?: string[];
};

type TestSuiteResult = {
  name: string;
  status: string;
  assertionResults: AssertionResult[];
  startTime?: number;
  endTime?: number;
};

type VitestJsonReport = {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  startTime?: number;
  testResults: TestSuiteResult[];
};

function normalizeFilePath(name: string): string {
  const base = path.basename(name);
  const match = base.match(/^(.+?)\.test\.(ts|tsx)$/);
  return match ? match[1] : base;
}

export async function GET() {
  try {
    const projectRoot = getProjectRoot();
    const resultsPath = path.join(projectRoot, 'test-reports', 'unit', 'results.json');
    const raw = await fs.readFile(resultsPath, 'utf-8');
    const data = JSON.parse(raw) as VitestJsonReport;

    const suites = data.testResults.map((suite) => ({
      file: normalizeFilePath(suite.name),
      filePath: suite.name,
      status: suite.status,
      passed: suite.assertionResults.filter((assertion) => assertion.status === 'passed').length,
      failed: suite.assertionResults.filter((assertion) => assertion.status === 'failed').length,
      total: suite.assertionResults.length,
      durationMs: suite.endTime && suite.startTime ? suite.endTime - suite.startTime : 0,
      tests: suite.assertionResults.map((test) => ({
        fullName: test.fullName,
        title: test.title,
        status: test.status,
        durationMs: test.duration ?? 0,
        failureMessages: test.failureMessages ?? [],
      })),
    }));

    return NextResponse.json({
      success: data.success,
      numTotalTests: data.numTotalTests,
      numPassedTests: data.numPassedTests,
      numFailedTests: data.numFailedTests,
      numPendingTests: data.numPendingTests,
      startTime: data.startTime,
      suites,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test report not found or invalid',
        detail: unknownErrorMessage(error),
        hint: 'Run pnpm test:unit from the project app dir (writes test-reports/unit/results.json). Set REPOPLANNER_PROJECT_ROOT for standalone.',
      },
      { status: 404 },
    );
  }
}
