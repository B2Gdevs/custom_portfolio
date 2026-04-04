import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

/** GSD lineage — creator perspective (embed starts ~10m10s). */
const YOUTUBE_ID = '958hJe-AcvU';
const YOUTUBE_START_SEC = 610;
const GET_ANYTHING_DONE_REPO = 'https://github.com/MagicbornStudios/get-anything-done';
const GSD_UPSTREAM = 'https://github.com/gsd-build/get-shit-done';

export default function GetAnythingDoneSection() {
  const embedSrc = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?start=${YOUTUBE_START_SEC}`;

  return (
    <section className="section-shell border-t border-border/60 bg-dark/30">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-16">
        <div className="max-w-2xl">
          <p className="section-kicker">Get Anything Done</p>
          <h2 className="font-display text-4xl text-primary md:text-5xl">
            A monorepo home for GSD-shaped planning—plus how we measure it.
          </h2>
          <p className="mt-5 text-lg leading-8 text-text-muted">
            We are growing <strong className="font-medium text-primary">get-anything-done</strong> inside this
            monorepo: CLI and packs that stay faithful to{' '}
            <a
              href={GSD_UPSTREAM}
              className="text-accent underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get Shit Done
            </a>{' '}
            principles—small loops, visible state, and specs agents can execute against—while wiring an{' '}
            <strong className="font-medium text-primary">evaluation framework</strong> so drift and regressions show
            up in benchmarks, not only in vibes.
          </p>
          <p className="mt-4 text-base leading-7 text-text-muted">
            The talk comes from the GSD lineage—useful context on why tight loops and evaluable specs beat ad-hoc
            prompts alone. The repository link is the working tree for our CLI, packs, and benchmark runs as they
            land.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={GET_ANYTHING_DONE_REPO}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github size={18} aria-hidden />
              MagicbornStudios / get-anything-done
            </a>
            <Link
              href="/docs/global/planning/plans/gad-eval/PLAN"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-dark-elevated px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Eval framework plan
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>

        <div className="w-full">
          <div className="overflow-hidden rounded-2xl border border-border bg-dark shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="aspect-video w-full">
              <iframe
                title="Get Shit Done — creator perspective on structured planning"
                className="h-full w-full"
                src={embedSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            <a
              href={`https://www.youtube.com/watch?v=${YOUTUBE_ID}&t=${YOUTUBE_START_SEC}s`}
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
