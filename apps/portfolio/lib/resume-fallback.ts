/**
 * Repo-authored resume metadata used when Payload-backed records are unavailable.
 * Kept free of Node built-ins so client-safe modules (e.g. loading skeleton defaults) can import the count.
 */
export interface ResumeEntry {
  slug: string;
  fileName: string;
  title: string;
  role: string;
  summary: string;
  featuredOrder: number;
}

export const FALLBACK_RESUMES: ResumeEntry[] = [
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

/** Repo-authored resume count — used by loading skeletons. */
export const FALLBACK_RESUME_COUNT = FALLBACK_RESUMES.length;
