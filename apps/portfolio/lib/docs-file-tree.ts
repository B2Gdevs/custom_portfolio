import type { DocLink } from '@/lib/docs';
import { buildDocSections, getDocPriority, isPlanningDocSlug, splitSectionDocs } from '@/lib/docs';

export type DocFileTreeNode =
  | {
      kind: 'dir';
      treePath: string;
      name: string;
      children: DocFileTreeNode[];
    }
  | {
      kind: 'file';
      treePath: string;
      name: string;
      slug: string;
    };

function sortTreeNodes(a: DocFileTreeNode, b: DocFileTreeNode): number {
  if (a.kind !== b.kind) {
    return a.kind === 'dir' ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
}

export function buildDocFileTree(docs: DocLink[]): DocFileTreeNode {
  const sections = buildDocSections(docs);

  const sectionNodes: DocFileTreeNode[] = sections.map((section) => {
    const { planningDocs, referenceDocs } = splitSectionDocs(section.docs);
    const children: DocFileTreeNode[] = [];

    if (planningDocs.length > 0) {
      children.push({
        kind: 'dir',
        treePath: `content/docs/${section.key}/planning`,
        name: 'planning',
        children: planningDocs
          .map((doc) => {
            const leaf = doc.slug.split('/').pop() || doc.slug;
            return {
              kind: 'file' as const,
              treePath: `content/docs/${doc.slug}.mdx`,
              name: `${leaf}.mdx`,
              slug: doc.slug,
            };
          })
          .sort((a, b) => {
            const p = getDocPriority(a.slug) - getDocPriority(b.slug);
            if (p !== 0) return p;
            return a.name.localeCompare(b.name);
          }),
      });
    }

    referenceDocs.forEach((doc) => {
      const leaf = doc.slug.split('/').pop() || doc.slug;
      children.push({
        kind: 'file',
        treePath: `content/docs/${doc.slug}.mdx`,
        name: `${leaf}.mdx`,
        slug: doc.slug,
      });
    });

    children.sort(sortTreeNodes);

    return {
      kind: 'dir',
      treePath: `content/docs/${section.key}`,
      name: section.key,
      children,
    };
  });

  return {
    kind: 'dir',
    treePath: 'content',
    name: 'content',
    children: [
      {
        kind: 'dir',
        treePath: 'content/docs',
        name: 'docs',
        children: sectionNodes,
      },
    ],
  };
}

/** Virtual file path for the current doc URL (matches `treePath` on file nodes). */
export function docSlugToTreePath(slug: string): string {
  return `content/docs/${slug}.mdx`;
}

/** Relative path under `content/docs` for folder ZIP download; undefined for virtual roots. */
export function docTreePathToArchivePrefix(treePath: string): string | undefined {
  const p = 'content/docs/';
  if (!treePath.startsWith(p)) return undefined;
  const rest = treePath.slice(p.length);
  return rest || undefined;
}

/** All ancestor folder tree paths for a file node (for default expansion). */
export function ancestorTreePathsForSlug(slug: string): Set<string> {
  const parts = slug.split('/').filter(Boolean);
  const out = new Set<string>(['content', 'content/docs']);
  let acc = 'content/docs';
  for (let i = 0; i < parts.length - 1; i += 1) {
    acc = `${acc}/${parts[i]}`;
    out.add(acc);
  }
  if (isPlanningDocSlug(slug)) {
    const section = parts[0];
    if (section) {
      out.add(`content/docs/${section}/planning`);
    }
  }
  return out;
}

/**
 * Default expanded folders when `?open=` is absent: all closed on overview/apps;
 * on a doc page, only ancestors of the active slug (so the current file is visible).
 */
export function defaultExpandedForDocsPath(pathname: string | null): Set<string> {
  if (!pathname?.startsWith('/docs/')) {
    return new Set();
  }
  const slug = pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
  if (!slug || slug === 'apps' || slug.startsWith('apps/')) {
    return new Set();
  }
  return ancestorTreePathsForSlug(slug);
}
