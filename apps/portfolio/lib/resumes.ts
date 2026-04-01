import { existsSync } from 'node:fs';
import path from 'node:path';
import { runResumeRecordsWorker } from '@/lib/resume-records-worker-runner';

export interface ResumeEntry {
  slug: string;
  fileName: string;
  title: string;
  role: string;
  summary: string;
  featuredOrder: number;
}

type ResumeRecordDoc = Partial<
  Record<
    'slug' | 'fileName' | 'title' | 'role' | 'summary' | 'featuredOrder' | 'published',
    unknown
  >
>;

const FALLBACK_RESUMES: ResumeEntry[] = [
  {
    slug: 'blitzpanel-founding-engineer',
    fileName: 'blitzpanel_resume.html',
    title: 'Blitzpanel Founding Engineer Resume',
    role: 'Founding engineer, internal automation, and schema-driven tooling for quote-to-build workflows',
    summary:
      'Tailored toward Blitzpanel: pipeline automation, CAD-adjacent spatial data thinking, generated multi-language contracts, and operator-first internal tools.',
    featuredOrder: 0,
  },
  {
    slug: 'your-dream-job',
    fileName: 'dream_job_resume.html',
    title: 'Your Dream Job Resume',
    role: 'Capital Factory Austin - startup ecosystem, founder support, and community building',
    summary:
      "A light editorial, Austin-focused resume tailored to Capital Factory's open-ended dream-role application and founder ecosystem work.",
    featuredOrder: 1,
  },
  {
    slug: 'openweb-ui',
    fileName: 'openweb_ui.html',
    title: 'Developer Relations Resume',
    role: 'DevRel, developer advocacy, and technical writing',
    summary:
      'A print-ready version centered on developer-facing product work, advocacy, and communication.',
    featuredOrder: 2,
  },
  {
    slug: 'bild',
    fileName: 'bild_resume.html',
    title: 'AI Engineer Resume',
    role: 'AI engineer, founding engineer, and systems builder',
    summary:
      'Tailored toward AI product work, systems architecture, and high-velocity startup execution.',
    featuredOrder: 3,
  },
  {
    slug: 'autohdr',
    fileName: 'autohdr_resume.html',
    title: 'AI and Imaging Resume',
    role: 'Full-stack engineer focused on AI and image systems',
    summary: 'Highlights image pipelines, applied ML work, and backend systems for imaging-heavy roles.',
    featuredOrder: 4,
  },
  {
    slug: 'axiom',
    fileName: 'axiom_resume.html',
    title: 'Full-Stack Systems Resume',
    role: 'Full-stack engineer, founder, and systems builder',
    summary: 'A broader systems-oriented resume for founding-engineer and full-stack product roles.',
    featuredOrder: 5,
  },
];

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
