'use client';

import Link from 'next/link';
import { BookOpen, Layers, MessageSquare, Terminal, Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSiteCopilotOptional } from '@/components/site/SiteCopilotContext';

const APP_CARD_ICONS = {
  'message-square': MessageSquare,
  terminal: Terminal,
  layers: Layers,
  'book-open': BookOpen,
} as const;

export type AppsHubAppCardIconName = keyof typeof APP_CARD_ICONS;

type AppsHubAppCardProps = {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: AppsHubAppCardIconName;
  cta: string;
  note: ReactNode;
};

export function AppsHubAppCard({
  id,
  title,
  description,
  href,
  iconName,
  cta,
  note,
}: AppsHubAppCardProps) {
  const copilot = useSiteCopilotOptional();
  const coverImageContext = `app-cover:${id}`;
  const Icon = APP_CARD_ICONS[iconName];

  return (
    <article className="story-card flex h-full flex-col p-6 md:p-8">
      <div className="mb-4 flex items-start gap-3">
        <div className="group relative flex-shrink-0">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-dark text-accent">
            <Icon size={22} aria-hidden />
          </span>
          {copilot ? (
            <button
              type="button"
              onClick={() => copilot.openChatForCoverImage(coverImageContext)}
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-dark/85 text-accent opacity-0 shadow-inner transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus:pointer-events-auto focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Open chat to describe a cover image for ${title}`}
            >
              <Wand2 size={20} aria-hidden />
            </button>
          ) : null}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
        </div>
      </div>
      <div className="mb-4 flex-1 text-xs leading-relaxed text-text-muted/90">{note}</div>
      <Link
        href={href}
        className="inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
      >
        {cta}
      </Link>
    </article>
  );
}
