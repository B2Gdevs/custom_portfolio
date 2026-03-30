'use client';

/**
 * File tree for hierarchical navigation (docs, generated structures).
 * @credit Vercel AI Elements (Apache-2.0) — adapted for Base UI Collapsible + Next.js.
 */
import { ChevronRightIcon, Download, FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react';
import Link from 'next/link';
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ContextMenuContent,
  ContextMenuLinkItem,
  ContextMenuRoot,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { docsArchiveDownloadUrl, docsSourceDownloadUrl } from '@/lib/docs-download-urls';
import { cn } from '@/lib/utils';

interface FileTreeContextType {
  expandedPaths: Set<string>;
  setPathOpen: (path: string, open: boolean) => void;
  selectedPath?: string;
  onSelect?: (path: string) => void;
}

const FileTreeContext = createContext<FileTreeContextType>({
  expandedPaths: new Set(),
  setPathOpen: () => undefined,
});

export type FileTreeProps = HTMLAttributes<HTMLDivElement> & {
  expanded?: Set<string>;
  defaultExpanded?: Set<string>;
  selectedPath?: string;
  onSelect?: (path: string) => void;
  onExpandedChange?: (expanded: Set<string>) => void;
};

export function FileTree({
  expanded: controlledExpanded,
  defaultExpanded = new Set(),
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  ...props
}: FileTreeProps) {
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpanded));
  const expandedPaths = controlledExpanded ?? internalExpanded;

  const setPathOpen = useCallback(
    (path: string, open: boolean) => {
      const next = new Set(expandedPaths);
      if (open) {
        next.add(path);
      } else {
        next.delete(path);
      }
      if (controlledExpanded === undefined) {
        setInternalExpanded(next);
      }
      onExpandedChange?.(next);
    },
    [controlledExpanded, expandedPaths, onExpandedChange]
  );

  const value = useMemo(
    () => ({ expandedPaths, setPathOpen, selectedPath, onSelect }),
    [expandedPaths, setPathOpen, selectedPath, onSelect]
  );

  return (
    <FileTreeContext.Provider value={value}>
      <div
        className={cn(
          'rounded-md border border-border/80 bg-dark-alt/80 font-mono text-[13px] leading-snug text-text backdrop-blur-sm',
          className
        )}
        role="tree"
        {...props}
      >
        <div className="p-1.5">{children}</div>
      </div>
    </FileTreeContext.Provider>
  );
}

export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
  href?: string;
  /** Full label for tooltip (e.g. virtual repo path). */
  tooltipLabel?: string;
  /** Relative path under `content/docs` for ZIP download. */
  folderArchivePrefix?: string;
};

export function FileTreeFolder({
  path,
  name,
  href,
  tooltipLabel,
  folderArchivePrefix,
  className,
  children,
  ...props
}: FileTreeFolderProps) {
  const { expandedPaths, setPathOpen, selectedPath } = useContext(FileTreeContext);
  const isExpanded = expandedPaths.has(path);
  const isSelected = selectedPath === path;

  const triggerClass = cn(
    'flex items-center gap-0.5 rounded px-1.5 py-1 text-left text-text-muted transition-colors hover:bg-white/5 hover:text-primary',
    isSelected && 'bg-white/10 text-primary'
  );

  const iconAndLabel = (
    <>
      <FileTreeIcon>
        {isExpanded ? (
          <FolderOpenIcon className="size-3.5 text-accent" />
        ) : (
          <FolderIcon className="size-3.5 text-accent-3" />
        )}
      </FileTreeIcon>
      <FileTreeName className="text-text">{name}</FileTreeName>
    </>
  );

  const row = (
    <div className={cn('flex items-center gap-0.5 rounded', isSelected && 'bg-white/10')}>
      <button
        type="button"
        onClick={() => setPathOpen(path, !isExpanded)}
        aria-label={isExpanded ? `Collapse ${name}` : `Expand ${name}`}
        className={cn(triggerClass, 'w-auto shrink-0 px-1')}
      >
        <ChevronRightIcon
          className={cn(
            'size-3.5 shrink-0 text-text-muted transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      </button>
      {href ? (
        <Link
          href={href}
          className={cn(triggerClass, 'min-w-0 flex-1')}
          role="treeitem"
          aria-selected={isSelected}
          tabIndex={0}
        >
          {iconAndLabel}
        </Link>
      ) : (
        <CollapsibleTrigger className={cn(triggerClass, 'min-w-0 flex-1')}>
          {iconAndLabel}
        </CollapsibleTrigger>
      )}
    </div>
  );

  const tip = tooltipLabel ?? name;
  const wrappedRow = (
    <Tooltip>
      <TooltipTrigger delay={400} render={row} />
      <TooltipContent side="right" align="center" className="max-w-sm break-all">
        {tip}
      </TooltipContent>
    </Tooltip>
  );

  const archiveHref = folderArchivePrefix
    ? docsArchiveDownloadUrl(folderArchivePrefix)
    : undefined;
  /** Matches `Content-Disposition` from `/api/docs/archive` (prefix with `/` → `-`). */
  const zipFileName = folderArchivePrefix
    ? `${folderArchivePrefix.replace(/\//g, '-')}.zip`
    : '';

  return (
    <div className={cn('', className)} role="presentation" {...props}>
      <Collapsible open={isExpanded} onOpenChange={(open) => setPathOpen(path, open)}>
        <div className="rounded" role="treeitem" aria-selected={isSelected} tabIndex={-1}>
          {archiveHref ? (
            <ContextMenuRoot>
              <ContextMenuTrigger className="block w-full rounded outline-none">
                {wrappedRow}
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[11rem] max-w-[min(100vw-2rem,16rem)]">
                <ContextMenuLinkItem
                  href={archiveHref}
                  aria-label={`Download ${zipFileName}`}
                  className="items-center gap-2.5 py-2"
                >
                  <Download className="size-4 shrink-0 text-text-muted" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="truncate font-medium leading-tight text-popover-foreground">{zipFileName}</span>
                    <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                      ZIP
                    </span>
                  </span>
                </ContextMenuLinkItem>
              </ContextMenuContent>
            </ContextMenuRoot>
          ) : (
            wrappedRow
          )}
          <CollapsibleContent>
            <div className="ml-4 border-l border-border/60 pl-2">{children}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

export type FileTreeFileProps = HTMLAttributes<HTMLDivElement> & {
  path: string;
  name: string;
  icon?: ReactNode;
  /** When set, navigates with Next.js Link (preferred for docs). */
  href?: string;
  tooltipLabel?: string;
  /** Content slug (e.g. `books/state`) for MDX download. */
  fileSourceSlug?: string;
};

export function FileTreeFile({
  path,
  name,
  icon,
  href,
  tooltipLabel,
  fileSourceSlug,
  className,
  children,
  ...props
}: FileTreeFileProps) {
  const { selectedPath, onSelect } = useContext(FileTreeContext);
  const isSelected = selectedPath === path;

  const rowClass = cn(
    'flex cursor-pointer items-center gap-0.5 rounded px-1.5 py-1 transition-colors hover:bg-white/5',
    isSelected && 'bg-white/10 text-primary',
    !isSelected && 'text-text-muted',
    className
  );

  const body = (
    <>
      <span className="size-3.5 shrink-0" aria-hidden />
      <FileTreeIcon>{icon ?? <FileIcon className="size-3.5 text-text-muted" />}</FileTreeIcon>
      <FileTreeName>{name}</FileTreeName>
    </>
  );

  const tip = tooltipLabel ?? name;
  const downloadHref = fileSourceSlug ? docsSourceDownloadUrl(fileSourceSlug) : undefined;

  if (href) {
    const link = (
      <Link
        href={href}
        className={rowClass}
        role="treeitem"
        aria-selected={isSelected}
        tabIndex={0}
      >
        {children ?? body}
      </Link>
    );

    const withTip = (
      <Tooltip>
        <TooltipTrigger delay={400} render={link} />
        <TooltipContent side="right" align="center" className="max-w-sm break-all">
          {tip}
        </TooltipContent>
      </Tooltip>
    );

    if (downloadHref) {
      return (
        <ContextMenuRoot>
          <ContextMenuTrigger className="block w-full rounded outline-none">{withTip}</ContextMenuTrigger>
          <ContextMenuContent className="min-w-[11rem] max-w-[min(100vw-2rem,16rem)]">
            <ContextMenuLinkItem
              href={downloadHref}
              aria-label={`Download ${name} as MDX`}
              className="items-center gap-2.5 py-2"
            >
              <Download className="size-4 shrink-0 text-text-muted" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <span className="truncate font-medium leading-tight text-popover-foreground">{name}</span>
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                  MDX
                </span>
              </span>
            </ContextMenuLinkItem>
          </ContextMenuContent>
        </ContextMenuRoot>
      );
    }

    return withTip;
  }

  const row = (
    <div
      className={rowClass}
      onClick={() => onSelect?.(path)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(path);
        }
      }}
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={0}
      {...props}
    >
      {children ?? body}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger delay={400} render={row} />
      <TooltipContent side="right" align="center" className="max-w-sm break-all">
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

export type FileTreeIconProps = HTMLAttributes<HTMLSpanElement>;

export function FileTreeIcon({ className, children, ...props }: FileTreeIconProps) {
  return (
    <span className={cn('shrink-0', className)} {...props}>
      {children}
    </span>
  );
}

export type FileTreeNameProps = HTMLAttributes<HTMLSpanElement>;

export function FileTreeName({ className, children, ...props }: FileTreeNameProps) {
  return (
    <span className={cn('truncate', className)} {...props}>
      {children}
    </span>
  );
}

export type FileTreeActionsProps = HTMLAttributes<HTMLDivElement>;

export function FileTreeActions({ className, children, ...props }: FileTreeActionsProps) {
  return (
    <div
      className={cn('ml-auto flex items-center gap-1', className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}
