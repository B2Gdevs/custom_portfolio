import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

const YOUTUBE_ID = 'MppKHh_MfFc';
const MB_GSD_FORK = 'https://github.com/MagicbornStudios/get-shit-done';
const GSD_UPSTREAM = 'https://github.com/gsd-build/get-shit-done';
const GAD_REPO = 'https://github.com/MagicbornStudios/get-anything-done';

export default function HumanLoopPlanningSection() {
  return (
    <section className="section-shell border-t border-border/60 bg-dark/40">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-16">
        <div className="max-w-2xl">
          <p className="section-kicker">Human in the loop</p>
          <h2 className="font-display text-4xl text-primary md:text-5xl">
            Plan with the same care we ship code.
          </h2>
          <p className="mt-5 text-lg leading-8 text-text-muted">
            We gather requirements and keep planning docs in step with implementation—especially when coding agents do the heavy lifting. The loop is{' '}
            <strong className="font-medium text-primary">small batches</strong>,{' '}
            <strong className="font-medium text-primary">clear decisions</strong>, and{' '}
            <strong className="font-medium text-primary">verification</strong> before the next slice—not a handoff wall.
          </p>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Our practice is inspired by the{' '}
            <a
              href={GSD_UPSTREAM}
              className="text-accent underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get Shit Done
            </a>{' '}
            approach to context and spec-driven work—we do not ship the full GSD stack, but we track the ecosystem and fold in what fits{' '}
            <a
              href={GAD_REPO}
              className="text-accent underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              get-anything-done (GAD)
            </a>
            : skills, `gad` CLI, and planning files compiled into these docs.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={MB_GSD_FORK}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github size={18} aria-hidden />
              MagicbornStudios / get-shit-done
            </a>
            <a
              href={GSD_UPSTREAM}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-dark-elevated px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github size={18} className="opacity-80" aria-hidden />
              gsd-build / upstream
            </a>
            <Link
              href="/docs/get-anything-done/planning/state"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-dark-elevated px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              GAD planning state
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>

        <div className="w-full">
          <div className="overflow-hidden rounded-2xl border border-border bg-dark shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="aspect-video w-full">
              <iframe
                title="Human-in-the-loop planning and coding agents"
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            <a
              href={`https://www.youtube.com/watch?v=${YOUTUBE_ID}`}
              className="underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Open on YouTube
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
