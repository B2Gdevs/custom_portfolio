import { existsSync } from 'node:fs';
import path from 'node:path';

export interface ResumeEntry {
  slug: string;
  fileName: string;
  title: string;
  role: string;
  summary: string;
}

const resumes: ResumeEntry[] = [
  {
    slug: 'your-dream-job',
    fileName: 'dream_job_resume.html',
    title: 'Your Dream Job Resume',
    role: 'Capital Factory Austin — startup ecosystem, founder support, and community building',
    summary: "A more cinematic Austin-focused resume tailored to Capital Factory’s open-ended dream-role application and founder ecosystem work.",
  },
  {
    slug: 'openweb-ui',
    fileName: 'openweb_ui.html',
    title: 'Developer Relations Resume',
    role: 'DevRel, developer advocacy, and technical writing',
    summary: 'A print-ready version centered on developer-facing product work, advocacy, and communication.',
  },
  {
    slug: 'bild',
    fileName: 'bild_resume.html',
    title: 'AI Engineer Resume',
    role: 'AI engineer, founding engineer, and systems builder',
    summary: 'Tailored toward AI product work, systems architecture, and high-velocity startup execution.',
  },
  {
    slug: 'autohdr',
    fileName: 'autohdr_resume.html',
    title: 'AI and Imaging Resume',
    role: 'Full-stack engineer focused on AI and image systems',
    summary: 'Highlights image pipelines, applied ML work, and backend systems for imaging-heavy roles.',
  },
  {
    slug: 'axiom',
    fileName: 'axiom_resume.html',
    title: 'Full-Stack Systems Resume',
    role: 'Full-stack engineer, founder, and systems builder',
    summary: 'A broader systems-oriented resume for founding-engineer and full-stack product roles.',
  },
];

const resumeDirectoryCandidates = [
  path.resolve(process.cwd(), 'apps', 'portfolio', 'misc', 'html_resumes'),
  path.resolve(process.cwd(), 'misc', 'html_resumes'),
];

export function getResumes(): ResumeEntry[] {
  return resumes;
}

export function getResumeBySlug(slug: string): ResumeEntry | undefined {
  return resumes.find((resume) => resume.slug === slug);
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
