import path from 'path';

const CONTENT_DOCS_ABS = path.resolve(process.cwd(), 'content', 'docs');

export function contentDocsRoot(): string {
  return CONTENT_DOCS_ABS;
}

/** Resolve a relative path under `content/docs`; rejects traversal. */
export function resolveUnderContentDocs(rel: string): string | null {
  const parts = rel.split(/[/\\]+/).filter(Boolean);
  if (parts.some((p) => p === '..' || p === '.')) return null;
  const abs = path.resolve(CONTENT_DOCS_ABS, ...parts);
  const root = path.resolve(CONTENT_DOCS_ABS);
  const relative = path.relative(root, abs);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return abs;
}
