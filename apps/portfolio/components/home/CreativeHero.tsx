import Link from 'next/link';
import { ArrowRight, BookOpenText } from 'lucide-react';
import type { FeaturedBookShowcase } from '@/lib/featured-book';

export default function CreativeHero({ featuredBook }: { featuredBook: FeaturedBookShowcase }) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="hero-atmosphere" />
      <div className="hero-grain" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-center lg:gap-20">
        <div className="max-w-3xl">
          <p className="section-kicker">{featuredBook.heroEyebrow}</p>
          <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.03em] text-primary md:text-7xl">
            Start with the book.
            <span className="mt-3 block text-text-muted">Everything else can wait a moment.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted md:text-xl">
            {featuredBook.heroSummary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/books/${featuredBook.slug}/read`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-secondary transition-transform hover:-translate-y-0.5"
            >
              <BookOpenText size={18} />
              Start reading
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-dark-elevated px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Enter the archive
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 text-sm text-text-muted sm:grid-cols-3">
            <div className="story-metric">
              <span className="story-metric-value">{featuredBook.chapterCount || '3'}</span>
              <span>chapter arcs staged</span>
            </div>
            <div className="story-metric">
              <span className="story-metric-value">{featuredBook.pageCount || '70+'}</span>
              <span>pages ready to read</span>
            </div>
            <div className="story-metric">
              <span className="story-metric-value">Now</span>
              <span>{featuredBook.status}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="floating-book-scene">
            <div className="floating-book-shadow" />
            <div className="floating-book">
              <div className="floating-book-spine">{featuredBook.author}</div>
              <div className="floating-book-cover">
                <p className="section-kicker text-[0.68rem]">Featured reading</p>
                <h2 className="font-display text-4xl text-secondary md:text-5xl">{featuredBook.title}</h2>
                <p className="mt-4 text-sm leading-7 text-secondary/80">{featuredBook.description}</p>
              </div>
            </div>
            <div className="story-note">
              <p className="section-kicker text-[0.68rem]">Current focus</p>
              <p className="mt-3 text-sm leading-7 text-text">
                The site now opens like a threshold into the world: story first, songs in orbit, technical depth farther in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
