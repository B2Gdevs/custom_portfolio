'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { FileText, FolderKanban, Home, LayoutGrid } from 'lucide-react';
import type { ContentMeta } from '@/lib/content';
import {
  buildDocFileTree,
  defaultExpandedForDocsPath,
  docSlugToTreePath,
  docTreePathToArchivePrefix,
  type DocFileTreeNode,
} from '@/lib/docs-file-tree';
import { parseDocsOpenParam, serializeDocsOpenParam } from '@/lib/docs-nav-params';
import { FileTree, FileTreeFile, FileTreeFolder } from '@/components/ui/file-tree';

function DocTreeBranch({ node, querySuffix }: { node: DocFileTreeNode; querySuffix: string }) {
  if (node.kind === 'file') {
    const base = `/docs/${node.slug}`;
    const href = querySuffix ? `${base}?${querySuffix}` : base;
    return (
      <FileTreeFile
        key={node.treePath}
        path={node.treePath}
        name={node.name}
        href={href}
        tooltipLabel={node.treePath}
        fileSourceSlug={node.slug}
        icon={<FileText className="size-3.5 text-accent-3" />}
      />
    );
  }

  return (
    <FileTreeFolder
      key={node.treePath}
      path={node.treePath}
      name={node.name}
      tooltipLabel={node.treePath}
      folderArchivePrefix={docTreePathToArchivePrefix(node.treePath)}
    >
      {node.children.map((child) => (
        <DocTreeBranch key={child.treePath} node={child} querySuffix={querySuffix} />
      ))}
    </FileTreeFolder>
  );
}

interface DocsFileTreeNavProps {
  docs: Array<{ meta: ContentMeta; slug: string }>;
}

export function DocsFileTreeNav({ docs }: DocsFileTreeNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const root = useMemo(() => buildDocFileTree(docs), [docs]);

  const hasOpenInUrl = searchParams.has('open');
  const openFromUrl = useMemo(
    () => parseDocsOpenParam(searchParams.get('open')),
    [searchParams]
  );
  const fallbackExpanded = useMemo(() => defaultExpandedForDocsPath(pathname), [pathname]);

  const expandedPaths = hasOpenInUrl ? openFromUrl : fallbackExpanded;

  const selectedPath = useMemo(() => {
    if (!pathname?.startsWith('/docs/')) return undefined;
    const slug = pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
    if (!slug || slug === 'tools' || slug.startsWith('tools/')) return undefined;
    return docSlugToTreePath(slug);
  }, [pathname]);

  const setExpandedInUrl = useCallback(
    (next: Set<string>) => {
      const q = new URLSearchParams(searchParams.toString());
      const serialized = serializeDocsOpenParam(next);
      if (serialized) {
        q.set('open', serialized);
      } else {
        q.delete('open');
      }
      const qs = q.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const overviewActive = pathname === '/docs';
  const appsActive = pathname === '/docs/apps' || pathname?.startsWith('/docs/apps/');
  const querySuffix = searchParams.toString();

  return (
    <div className="space-y-3">
      <div className="space-y-0.5 border-b border-border/60 pb-3">
        <Link
          href={querySuffix ? `/docs?${querySuffix}` : '/docs'}
          className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[13px] font-medium leading-tight transition-colors ${
            overviewActive ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5 hover:text-primary'
          }`}
        >
          <Home size={15} className={overviewActive ? 'text-accent' : 'text-text-muted'} />
          Overview
        </Link>
        <Link
          href={querySuffix ? `/docs/apps?${querySuffix}` : '/docs/apps'}
          className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[13px] font-medium leading-tight transition-colors ${
            appsActive ? 'bg-white/10 text-primary' : 'text-text-muted hover:bg-white/5 hover:text-primary'
          }`}
        >
          <LayoutGrid size={15} className={appsActive ? 'text-accent' : 'text-text-muted'} />
          Apps
        </Link>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5 px-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
          <FolderKanban size={12} className="text-accent" />
          Files
        </div>
        <FileTree
          expanded={expandedPaths}
          onExpandedChange={setExpandedInUrl}
          selectedPath={selectedPath}
        >
          <DocTreeBranch node={root} querySuffix={querySuffix} />
        </FileTree>
      </div>
    </div>
  );
}
