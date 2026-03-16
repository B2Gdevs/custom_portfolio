import Link from 'next/link';
import { ArrowRight, BookText, FileCode2 } from 'lucide-react';

interface ArchiveGatewayProps {
  blogCount: number;
  docCount: number;
  latestPostTitle?: string;
  latestDocTitle?: string;
}

export default function ArchiveGateway({
  blogCount,
  docCount,
  latestPostTitle,
  latestDocTitle,
}: ArchiveGatewayProps) {
  const cards = [
    {
      title: 'Blog',
      description: 'Essays, build notes, and publishing posts from the workshop side of the practice.',
      href: '/blog',
      countLabel: `${blogCount} posts`,
      detail: latestPostTitle ? `Latest note: ${latestPostTitle}` : 'Longer reflections, build logs, and publishing notes.',
      icon: BookText,
    },
    {
      title: 'Documentation',
      description: 'Planning loops, architecture notes, requirements, and implementation docs.',
      href: '/docs',
      countLabel: `${docCount} docs`,
      detail: latestDocTitle ? `Recently updated: ${latestDocTitle}` : 'The technical side for people who want the deeper system view.',
      icon: FileCode2,
    },
  ];

  return (
    <section
      id="blog-and-docs"
      className="section-shell"
    >
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">Blog, docs</p>
        <h2 className="font-display text-4xl text-primary md:text-6xl">The public trail should stay simple.</h2>
        <p className="mt-5 text-lg leading-8 text-text-muted">
          Beyond the reader and the music, the two places we should keep directing people are the blog and the documentation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="story-card flex h-full flex-col justify-between p-6"
            >
              <div>
                <div className="mb-5 inline-flex rounded-full border border-border bg-dark p-3 text-accent">
                  <Icon size={18} />
                </div>
                <p className="section-kicker">{card.countLabel}</p>
                <h3 className="mt-2 font-display text-3xl text-primary">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-text-muted">{card.description}</p>
                <p className="mt-4 text-sm leading-7 text-text">{card.detail}</p>
              </div>

              <Link
                href={card.href}
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"
              >
                Open {card.title.toLowerCase()}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
        >
          All posts
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
        >
          Documentation home
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
