'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Download } from 'lucide-react';

function nodeToText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return nodeToText(props?.children);
  }
  return '';
}

export function CopyMarkdownSample({
  title = 'Markdown',
  filename,
  markdown,
  children,
}: {
  title?: string;
  filename?: string;
  /** Prefer this over `children` when using MDX + RSC — child extraction often yields empty strings. */
  markdown?: string;
  children?: React.ReactNode;
}) {
  const source = useMemo(() => {
    const raw =
      typeof markdown === 'string' && markdown.trim()
        ? markdown
        : nodeToText(children ?? null);
    return raw.replace(/\r\n/g, '\n').trim();
  }, [markdown, children]);
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [source]);

  const download = useCallback(() => {
    const base = filename?.trim() || 'sample.md';
    const name = base.endsWith('.md') ? base : `${base}.md`;
    const blob = new Blob([source], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [source, filename]);

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border/80 bg-dark-alt/50 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-dark-alt/80 px-4 py-2.5">
        <span className="text-sm font-semibold text-primary">{title}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:bg-dark-alt hover:text-primary"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:bg-dark-alt hover:text-primary"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
      <div className="px-5 py-6 text-text [&_a]:text-accent [&_a]:underline [&_table]:text-sm">
        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-th:border-border prose-td:border-border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
