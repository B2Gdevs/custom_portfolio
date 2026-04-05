import { existsSync } from 'node:fs';
import path from 'node:path';
import { FALLBACK_RESUMES, type ResumeEntry } from '@/lib/resume-fallback';
import { runResumeRecordsWorker } from '@/lib/resume-records-worker-runner';

export type { ResumeEntry } from '@/lib/resume-fallback';
export { FALLBACK_RESUME_COUNT } from '@/lib/resume-fallback';

type ResumeRecordDoc = Partial<
  Record<
    'slug' | 'fileName' | 'title' | 'role' | 'summary' | 'featuredOrder' | 'published',
    unknown
  >
>;

const resumeDirectoryCandidates = [
  path.resolve(process.cwd(), 'apps', 'portfolio', 'misc', 'html_resumes'),
  path.resolve(process.cwd(), 'misc', 'html_resumes'),
];

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function compareResumes(a: ResumeEntry, b: ResumeEntry): number {
  if (a.featuredOrder !== b.featuredOrder) {
    return a.featuredOrder - b.featuredOrder;
  }

  return a.title.localeCompare(b.title);
}

function toResumeEntry(doc: ResumeRecordDoc): ResumeEntry | null {
  const slug = asString(doc.slug);
  const fileName = asString(doc.fileName);
  const title = asString(doc.title);
  const role = asString(doc.role);
  const summary = asString(doc.summary);

  if (!slug || !fileName || !title || !role || !summary) {
    return null;
  }

  return {
    slug,
    fileName,
    title,
    role,
    summary,
    featuredOrder: asNumber(doc.featuredOrder) ?? 0,
  };
}

function fallbackResumes() {
  return [...FALLBACK_RESUMES].sort(compareResumes);
}

export function resolveResumeHtmlPath(fileName: string): string | null {
  for (const directory of resumeDirectoryCandidates) {
    const fullPath = path.join(directory, fileName);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

export function getResumeSourceEntries() {
  return fallbackResumes()
    .map((resume) => {
      const sourcePath = resolveResumeHtmlPath(resume.fileName);
      if (!sourcePath) {
        return null;
      }

      return {
        ...resume,
        sourcePath,
      };
    })
    .filter(
      (resume): resume is ResumeEntry & { sourcePath: string } => resume !== null,
    );
}

export async function getResumes(): Promise<ResumeEntry[]> {
  try {
    const result = await runResumeRecordsWorker();
    const body = result.body as
      | {
          ok?: boolean;
          resumes?: unknown[];
        }
      | undefined;

    if (body?.ok && Array.isArray(body.resumes) && body.resumes.length > 0) {
      return body.resumes
        .map((resume) => toResumeEntry(resume as ResumeRecordDoc))
        .filter((resume): resume is ResumeEntry => resume !== null)
        .sort(compareResumes);
    }
  } catch {
    // Fall back to the repo-authored metadata when Payload is unavailable.
  }

  return fallbackResumes();
}

export async function getResumeBySlug(slug: string): Promise<ResumeEntry | undefined> {
  const resumes = await getResumes();
  return resumes.find((resume) => resume.slug === slug);
}
