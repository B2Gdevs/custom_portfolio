import type { ContentMeta } from '@/lib/content';

export interface DocLink {
  meta: ContentMeta;
  slug: string;
}

export interface DocSection {
  key: string;
  label: string;
  description: string;
  docs: DocLink[];
}

export interface SectionDocGroups {
  planningDocs: DocLink[];
  referenceDocs: DocLink[];
}

interface DocSectionMeta {
  label: string;
  description: string;
  order: number;
}

const DOC_SECTION_META: Record<string, DocSectionMeta> = {
  global: {
    label: 'Global',
    description: 'Repo-wide planning loop (planning-docs, state, task registry) plus reference guides (e.g. global planning diagrams).',
    order: 0,
  },
  books: {
    label: 'Books',
    description: 'Reader notes, publishing workflow, and planning docs for the book side of the site.',
    order: 1,
  },
  'dialogue-forge': {
    label: 'Dialogue Forge',
    description: 'Editor notes, exporter docs, and planning material for the dialogue toolchain.',
    order: 2,
  },
  blog: {
    label: 'Blog',
    description: 'Planning docs for the writing surface, publishing loop, and how posts should work as a public-facing stream.',
    order: 3,
  },
  documentation: {
    label: 'Documentation',
    description: 'Planning docs for the docs site itself, including structure, requirements, and section-level improvements.',
    order: 4,
  },
  editor: {
    label: 'Editor',
    description: 'Planning docs for a writing/editor workflow that can compile authored content down to clean EPUB3.',
    order: 5,
  },
  magicborn: {
    label: 'Magicborn',
    description:
      'Worldbuilding and canon dossiers; planned RAG corpus alongside site docs and books planning.',
    order: 6,
  },
  listen: {
    label: 'Listen',
    description:
      'Planning for /listen — tracks, BandLab presets, discovery filters, and simple group-password locks.',
    order: 7,
  },
  'repo-planner': {
    label: 'Repo Planner',
    description: 'Vendored RepoPlanner CLI, submodule, local cockpit policy, and integration tasks.',
    order: 8,
  },
};

function formatSectionLabel(sectionKey: string): string {
  return sectionKey
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getSectionMeta(sectionKey: string): DocSectionMeta {
  return (
    DOC_SECTION_META[sectionKey] || {
      label: formatSectionLabel(sectionKey),
      description: 'Section-specific documentation and planning notes.',
      order: 999,
    }
  );
}

/** Sort order for docs in a section and for files under the virtual `planning/` folder in the file tree. */
export function getDocPriority(slug: string): number {
  const leaf = slug.split('/').pop() || slug;

  if (leaf === 'planning-docs') return 0;
  if (leaf === 'state') return 2;
  if (leaf === 'task-registry') return 3;
  if (leaf === 'errors-and-attempts') return 4;
  if (leaf === 'decisions') return 5;
  if (leaf === 'requirements') return 6;
  if (leaf === 'roadmap') return 7;
  if (leaf === 'index') return 8;
  if (leaf === 'overview') return 9;
  if (leaf === 'getting-started') return 10;
  /** Stream-specific planning under `books/planning/` (e.g. Mordred's Tale). */
  if (leaf.startsWith('mordreds-tale-')) {
    if (leaf.includes('state')) return 20;
    if (leaf.includes('task-registry')) return 21;
    if (leaf.includes('decisions')) return 22;
  }
  return 11;
}

export function isPlanningDocSlug(slug: string): boolean {
  const parts = slug.split('/').filter(Boolean);
  if (parts[0] === 'books' && parts[1] === 'planning') return true;
  const leaf = parts[parts.length - 1] || slug;
  return (
    leaf === 'planning-docs' ||
    leaf === 'state' ||
    leaf === 'task-registry' ||
    leaf === 'errors-and-attempts' ||
    leaf === 'decisions'
  );
}

function getDocTimestamp(doc: DocLink): number {
  const value = doc.meta.updated || doc.meta.date;
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function buildDocSections(docs: DocLink[]): DocSection[] {
  const groups = new Map<string, DocLink[]>();

  docs.forEach((doc) => {
    const [sectionKey] = doc.slug.split('/');
    const key = sectionKey || 'general';
    const existing = groups.get(key) || [];
    existing.push(doc);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .map(([key, sectionDocs]) => {
      const meta = getSectionMeta(key);
      return {
        key,
        label: meta.label,
        description: meta.description,
        docs: [...sectionDocs].sort((a, b) => {
          const priorityDiff = getDocPriority(a.slug) - getDocPriority(b.slug);
          if (priorityDiff !== 0) {
            return priorityDiff;
          }

          if (typeof a.meta.order === 'number' && typeof b.meta.order === 'number') {
            const orderDiff = a.meta.order - b.meta.order;
            if (orderDiff !== 0) {
              return orderDiff;
            }
          }

          const timestampDiff = getDocTimestamp(b) - getDocTimestamp(a);
          if (timestampDiff !== 0) {
            return timestampDiff;
          }

          return a.meta.title.localeCompare(b.meta.title);
        }),
      };
    })
    .sort((a, b) => {
      const orderDiff = getSectionMeta(a.key).order - getSectionMeta(b.key).order;
      if (orderDiff !== 0) {
        return orderDiff;
      }

      return a.label.localeCompare(b.label);
    });
}

export function splitSectionDocs(docs: DocLink[]): SectionDocGroups {
  const planningDocs: DocLink[] = [];
  const referenceDocs: DocLink[] = [];

  docs.forEach((doc) => {
    if (isPlanningDocSlug(doc.slug)) {
      planningDocs.push(doc);
      return;
    }

    referenceDocs.push(doc);
  });

  return { planningDocs, referenceDocs };
}
