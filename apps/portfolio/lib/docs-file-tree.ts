import type { DocLink } from '@/lib/docs';
import {
  BOOK_STREAM_ORDER,
  buildDocSections,
  getDocPriority,
  isPlanningDocSlug,
  splitSectionDocs,
} from '@/lib/docs';

export type DocFileTreeNode =
  | {
      kind: 'dir';
      treePath: string;
      name: string;
      href?: string;
      children: DocFileTreeNode[];
    }
  | {
      kind: 'file';
      treePath: string;
      name: string;
      slug: string;
    };

type PlanningTrieNode = {
  subdirs: Map<string, PlanningTrieNode>;
  files: DocLink[];
};

function emptyPlanningTrie(): PlanningTrieNode {
  return { subdirs: new Map(), files: [] };
}

function insertPlanningPath(root: PlanningTrieNode, segments: string[], doc: DocLink): void {
  if (segments.length === 1) {
    root.files.push(doc);
    return;
  }
  const [head, ...rest] = segments;
  if (!root.subdirs.has(head)) {
    root.subdirs.set(head, emptyPlanningTrie());
  }
  insertPlanningPath(root.subdirs.get(head)!, rest, doc);
}

function buildPlanningTrie(sectionKey: string, planningDocs: DocLink[]): PlanningTrieNode {
  const root = emptyPlanningTrie();
  const prefix = `${sectionKey}/planning/`;
  for (const doc of planningDocs) {
    if (!doc.slug.startsWith(prefix)) continue;
    const rel = doc.slug.slice(prefix.length);
    if (!rel) continue;
    insertPlanningPath(root, rel.split('/').filter(Boolean), doc);
  }
  return root;
}

function planningDocToFileNode(doc: DocLink): DocFileTreeNode {
  const leaf = doc.slug.split('/').pop() || doc.slug;
  return {
    kind: 'file',
    treePath: `content/docs/${doc.slug}.mdx`,
    name: `${leaf}.mdx`,
    slug: doc.slug,
  };
}

/** Nested folders under section `planning/` (e.g. `plans/…`); books title planning lives under `books/<title>/planning/`. */
function planningTrieToNodes(trie: PlanningTrieNode, pathPrefix: string): DocFileTreeNode[] {
  const sortedPlanningFiles = trie.files
    .filter((doc) => {
      const leaf = doc.slug.split('/').pop() || doc.slug;
      return leaf !== 'planning-docs';
    })
    .sort((a, b) => {
      const p = getDocPriority(a.slug) - getDocPriority(b.slug);
      if (p !== 0) return p;
      const leafA = a.slug.split('/').pop() || a.slug;
      const leafB = b.slug.split('/').pop() || b.slug;
      return leafA.localeCompare(leafB);
    });
  const fileChildren = sortedPlanningFiles.map(planningDocToFileNode);

  const dirChildren = [...trie.subdirs.entries()]
    .sort((x, y) => x[0].localeCompare(y[0]))
    .map(([name, child]) => {
      const dirPath = `${pathPrefix}/${name}`;
      return {
        kind: 'dir' as const,
        treePath: dirPath,
        name,
        children: planningTrieToNodes(child, dirPath),
      };
    });

  return [...fileChildren, ...dirChildren];
}

type DocFileTreeFileNode = Extract<DocFileTreeNode, { kind: 'file' }>;

function sortTreeNodes(a: DocFileTreeNode, b: DocFileTreeNode): number {
  if (a.kind !== b.kind) {
    return a.kind === 'dir' ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
}

/** Planning folder sorts before other section directories (e.g. `in-world/`). */
function sortSectionChildren(children: DocFileTreeNode[]): DocFileTreeNode[] {
  return [...children].sort((a, b) => {
    const aw = a.kind === 'dir' && a.name === 'planning' ? 0 : 1;
    const bw = b.kind === 'dir' && b.name === 'planning' ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return sortTreeNodes(a, b);
  });
}

const BOOK_STREAM_ORDER_MAP = new Map<string, number>(BOOK_STREAM_ORDER.map((s, i) => [s, i]));

/** Books: section `planning/` first, then title folders in series order, then reference dirs. */
function sortBooksSectionChildren(children: DocFileTreeNode[]): DocFileTreeNode[] {
  const weight = (n: DocFileTreeNode): number => {
    if (n.kind === 'dir' && n.name === 'planning') return 0;
    if (n.kind === 'dir' && BOOK_STREAM_ORDER_MAP.has(n.name)) return 1;
    return 2;
  };
  return [...children].sort((a, b) => {
    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;
    if (wa === 1 && wb === 1) {
      return (BOOK_STREAM_ORDER_MAP.get(a.name) ?? 99) - (BOOK_STREAM_ORDER_MAP.get(b.name) ?? 99);
    }
    return sortTreeNodes(a, b);
  });
}

type ReferenceTrieNode = {
  subdirs: Map<string, ReferenceTrieNode>;
  files: DocFileTreeFileNode[];
};

function emptyTrie(): ReferenceTrieNode {
  return { subdirs: new Map(), files: [] };
}

function insertReferenceDoc(root: ReferenceTrieNode, doc: DocLink, sectionKey: string): void {
  const parts = doc.slug.split('/').filter(Boolean);
  if (parts[0] !== sectionKey) return;
  const rel = parts.slice(1);
  if (rel.length === 0) return;

  let node = root;
  for (let i = 0; i < rel.length - 1; i += 1) {
    const seg = rel[i];
    if (!node.subdirs.has(seg)) {
      node.subdirs.set(seg, emptyTrie());
    }
    node = node.subdirs.get(seg)!;
  }

  const leaf = rel[rel.length - 1];
  node.files.push({
    kind: 'file',
    treePath: `content/docs/${doc.slug}.mdx`,
    name: `${leaf}.mdx`,
    slug: doc.slug,
  });
}

function trieToDocNodes(trie: ReferenceTrieNode, pathPrefix: string): DocFileTreeNode[] {
  const dirNodes: DocFileTreeNode[] = [];

  const sortedSubdirs = [...trie.subdirs.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, childTrie] of sortedSubdirs) {
    const dirPath = `${pathPrefix}/${name}`;
    const nested = trieToDocNodes(childTrie, dirPath);
    const filesHere = [...childTrie.files].sort((a, b) => {
      const p = getDocPriority(a.slug) - getDocPriority(b.slug);
      if (p !== 0) return p;
      return a.name.localeCompare(b.name);
    });
    const children = sortSectionChildren([...nested, ...filesHere]);
    dirNodes.push({
      kind: 'dir',
      treePath: dirPath,
      name,
      children,
    });
  }

  return dirNodes;
}

function referenceDocsToTreeNodes(sectionKey: string, referenceDocs: DocLink[]): DocFileTreeNode[] {
  const root = emptyTrie();
  for (const doc of referenceDocs) {
    insertReferenceDoc(root, doc, sectionKey);
  }

  const nested = trieToDocNodes(root, `content/docs/${sectionKey}`);
  const rootFiles = [...root.files].sort((a, b) => {
    const p = getDocPriority(a.slug) - getDocPriority(b.slug);
    if (p !== 0) return p;
    return a.name.localeCompare(b.name);
  });

  return sortSectionChildren([...nested, ...rootFiles]);
}

function getPlanningFolderTargetSlug(sectionKey: string, docs: DocLink[]): string | undefined {
  const slugs = new Set(docs.map((doc) => doc.slug));
  const candidates = [
    `${sectionKey}/planning/roadmap`,
    `${sectionKey}/roadmap`,
    `${sectionKey}/planning/state`,
    `${sectionKey}/planning/task-registry`,
    `${sectionKey}/planning/decisions`,
    `${sectionKey}/planning/errors-and-attempts`,
    `${sectionKey}/planning/planning-docs`,
  ];

  return candidates.find((slug) => slugs.has(slug));
}

export function buildDocFileTree(docs: DocLink[]): DocFileTreeNode {
  const sections = buildDocSections(docs);

  const sectionNodes: DocFileTreeNode[] = sections.map((section) => {
    const { planningDocs, referenceDocs } = splitSectionDocs(section.docs);
    const children: DocFileTreeNode[] = [];

    if (section.key === 'books') {
      const sectionOnlyPlanning = planningDocs.filter((d) => d.slug.startsWith('books/planning/'));
      if (sectionOnlyPlanning.length > 0) {
        const planningTargetSlug = getPlanningFolderTargetSlug(section.key, section.docs);
        const planningTrie = buildPlanningTrie(section.key, sectionOnlyPlanning);
        children.push({
          kind: 'dir',
          treePath: `content/docs/${section.key}/planning`,
          name: 'planning',
          href: planningTargetSlug ? `/docs/${planningTargetSlug}` : undefined,
          children: planningTrieToNodes(planningTrie, `content/docs/${section.key}/planning`),
        });
      }

      for (const stream of BOOK_STREAM_ORDER) {
        const streamDocs = planningDocs.filter((d) => d.slug.startsWith(`books/${stream}/planning/`));
        if (!streamDocs.length) continue;
        const sorted = [...streamDocs].sort((a, b) => {
          const p = getDocPriority(a.slug) - getDocPriority(b.slug);
          if (p !== 0) return p;
          const leafA = a.slug.split('/').pop() || a.slug;
          const leafB = b.slug.split('/').pop() || b.slug;
          return leafA.localeCompare(leafB);
        });
        const target = sorted.find((d) => d.slug.endsWith('/state')) ?? sorted[0];
        children.push({
          kind: 'dir',
          treePath: `content/docs/books/${stream}`,
          name: stream,
          children: [
            {
              kind: 'dir',
              treePath: `content/docs/books/${stream}/planning`,
              name: 'planning',
              href: target ? `/docs/${target.slug}` : undefined,
              children: sorted.map(planningDocToFileNode),
            },
          ],
        });
      }
    } else if (planningDocs.length > 0) {
      const planningTargetSlug = getPlanningFolderTargetSlug(section.key, section.docs);
      const planningTrie = buildPlanningTrie(section.key, planningDocs);

      children.push({
        kind: 'dir',
        treePath: `content/docs/${section.key}/planning`,
        name: 'planning',
        href: planningTargetSlug ? `/docs/${planningTargetSlug}` : undefined,
        children: planningTrieToNodes(planningTrie, `content/docs/${section.key}/planning`),
      });
    }

    children.push(...referenceDocsToTreeNodes(section.key, referenceDocs));

    const sortedChildren =
      section.key === 'books' ? sortBooksSectionChildren(children) : sortSectionChildren(children);

    return {
      kind: 'dir',
      treePath: `content/docs/${section.key}`,
      name: section.key,
      children: sortedChildren,
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
    if (section === 'books' && parts.length >= 4 && parts[2] === 'planning' && BOOK_STREAM_ORDER_MAP.has(parts[1]!)) {
      out.add(`content/docs/books/${parts[1]}/planning`);
    } else if (section && parts[1] === 'planning') {
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
