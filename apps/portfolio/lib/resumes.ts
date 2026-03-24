import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export interface ResumeEntry {
  slug: string;
  fileName: string;
  title: string;
  role: string;
  summary: string;
  sourcePath: string;
}

interface ResumeMetadataOverride {
  order: number;
  slug?: string;
  title?: string;
  role?: string;
  summary?: string;
}

const resumeMetadataOverrides: Record<string, ResumeMetadataOverride> = {
  'blitzpanel_resume.html': {
    order: 0,
    slug: 'blitzpanel-founding-engineer',
    title: 'Blitzpanel Founding Engineer Resume',
    role: 'Founding engineer, internal automation, and schema-driven tooling for quote-to-build workflows',
    summary:
      'Tailored toward Blitzpanel: pipeline automation, CAD-adjacent spatial data thinking, generated multi-language contracts, and operator-first internal tools.',
  },
  'dream_job_resume.html': {
    order: 1,
    slug: 'your-dream-job',
    title: 'Your Dream Job Resume',
    role: 'Capital Factory Austin — startup ecosystem, founder support, and community building',
    summary:
      "A light editorial, Austin-focused resume tailored to Capital Factory’s open-ended dream-role application and founder ecosystem work.",
  },
  'openweb_ui.html': {
    order: 2,
    slug: 'openweb-ui',
    title: 'Developer Relations Resume',
    role: 'DevRel, developer advocacy, and technical writing',
    summary:
      'A print-ready version centered on developer-facing product work, advocacy, and communication.',
  },
  'bild_resume.html': {
    order: 3,
    slug: 'bild',
    title: 'AI Engineer Resume',
    role: 'AI engineer, founding engineer, and systems builder',
    summary:
      'Tailored toward AI product work, systems architecture, and high-velocity startup execution.',
  },
  'autohdr_resume.html': {
    order: 4,
    slug: 'autohdr',
    title: 'AI and Imaging Resume',
    role: 'Full-stack engineer focused on AI and image systems',
    summary: 'Highlights image pipelines, applied ML work, and backend systems for imaging-heavy roles.',
  },
  'axiom_resume.html': {
    order: 5,
    slug: 'axiom',
    title: 'Full-Stack Systems Resume',
    role: 'Full-stack engineer, founder, and systems builder',
    summary: 'A broader systems-oriented resume for founding-engineer and full-stack product roles.',
  },
};

const resumeDirectoryCandidates = [
  path.resolve(process.cwd(), 'apps', 'portfolio', 'misc', 'html_resumes'),
  path.resolve(process.cwd(), 'misc', 'html_resumes'),
];

function getResumeDirectory(): string | null {
  return resumeDirectoryCandidates.find((directory) => existsSync(directory)) ?? null;
}

function stripTags(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMatch(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ? stripTags(match[1]) : null;
}

function deriveSlug(fileName: string, override?: ResumeMetadataOverride): string {
  if (override?.slug) {
    return override.slug;
  }

  return fileName
    .replace(/\.html$/i, '')
    .replace(/_resume$/i, '')
    .replace(/_/g, '-');
}

function deriveTitle(fileName: string, html: string, override?: ResumeMetadataOverride): string {
  if (override?.title) {
    return override.title;
  }

  const titleFromHtml = extractMatch(html, /<title>([\s\S]*?)<\/title>/i);
  if (titleFromHtml) {
    return titleFromHtml
      .replace(/^Benjamin Garrard\s*[—–-]\s*/i, '')
      .replace(/\s+Resume$/i, ' Resume')
      .trim();
  }

  return fileName
    .replace(/\.html$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function deriveRole(html: string, override?: ResumeMetadataOverride): string {
  if (override?.role) {
    return override.role;
  }

  return (
    extractMatch(html, /<div[^>]+class="[^"]*\brole\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    extractMatch(html, /<div[^>]+class="[^"]*\bsubtitle\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ??
    'Printable HTML resume'
  );
}

function deriveSummary(fileName: string, html: string, override?: ResumeMetadataOverride): string {
  if (override?.summary) {
    return override.summary;
  }

  const firstParagraph =
    extractMatch(html, /<p[^>]*>([\s\S]*?)<\/p>/i) ??
    'Standalone HTML resume source available for viewing and download.';

  return `${firstParagraph.slice(0, 157).trimEnd()}${firstParagraph.length > 157 ? '…' : ''}`;
}

function compareResumes(a: ResumeEntry, b: ResumeEntry): number {
  const orderA = resumeMetadataOverrides[a.fileName]?.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = resumeMetadataOverrides[b.fileName]?.order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.title.localeCompare(b.title);
}

function readResumeEntries(): ResumeEntry[] {
  const directory = getResumeDirectory();
  if (!directory) {
    return [];
  }

  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.html'))
    .map((fileName) => {
      const sourcePath = path.join(directory, fileName);
      const html = readFileSync(sourcePath, 'utf8');
      const override = resumeMetadataOverrides[fileName];

      return {
        slug: deriveSlug(fileName, override),
        fileName,
        title: deriveTitle(fileName, html, override),
        role: deriveRole(html, override),
        summary: deriveSummary(fileName, html, override),
        sourcePath,
      };
    })
    .sort(compareResumes);
}

export function getResumes(): ResumeEntry[] {
  return readResumeEntries();
}

export function getResumeBySlug(slug: string): ResumeEntry | undefined {
  return readResumeEntries().find((resume) => resume.slug === slug);
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
