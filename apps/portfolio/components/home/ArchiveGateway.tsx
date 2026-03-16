import Link from 'next/link';
import { ArrowRight, BookText, FileCode2, FileText, FolderKanban } from 'lucide-react';

interface ArchiveGatewayProps {
  resumeCount: number;
  projectCount: number;
  blogCount: number;
  docCount: number;
  featuredResumeTitle?: string;
  featuredProjectTitle?: string;
  latestPostTitle?: string;
  latestDocTitle?: string;
}

export default function ArchiveGateway({
  resumeCount,
  projectCount,
  blogCount,
  docCount,
  featuredResumeTitle,
  featuredProjectTitle,
  latestPostTitle,
  latestDocTitle,
}: ArchiveGatewayProps) {
  const cards = [
    {
      title: 'Resumes',
      description: 'Printable role-specific resumes collected in one place instead of scattered across the repo.',
      href: '/resumes',
      countLabel: `${resumeCount} versions`,
      detail: featuredResumeTitle ? `Start here: ${featuredResumeTitle}` : 'Tailored copies for quick sharing and printing.',
      icon: FileText,
    },
    {
      title: 'Projects',
      description: 'Products, prototypes, and systems that show how the work is built.',
      href: '/projects',
      countLabel: `${projectCount} projects`,
      detail: featuredProjectTitle ? `Current front shelf: ${featuredProjectTitle}` : 'Technical case studies and shipped work.',
      icon: FolderKanban,
    },
    {
      title: 'Writing',
      description: 'Essays, build notes, and postmortems from the workshop side of the practice.',
      href: '/blog',
      countLabel: `${blogCount} posts`,
      detail: latestPostTitle ? `Latest note: ${latestPostTitle}` : 'Longer reflections and narrative build logs.',
      icon: BookText,
    },
    {
      title: 'Documentation',
      description: 'Architecture notes, editor plans, implementation docs, and systems thinking.',
      href: '/docs',
      countLabel: `${docCount} docs`,
      detail: latestDocTitle ? `Recently updated: ${latestDocTitle}` : 'Technical depth for people who want to go deeper.',
      icon: FileCode2,
    },
  ];

  return (
    <section
      id="projects-and-more"
      className="section-shell"
    >
      <div className="mb-10 max-w-3xl">
        <p className="section-kicker">Projects, blog, docs</p>
        <h2 className="font-display text-4xl text-primary md:text-6xl">The technical work is still direct.</h2>
        <p className="mt-5 text-lg leading-8 text-text-muted">
          The front page starts with the book and the music, but the rest of the site is still plainly what it is: projects, writing, and documentation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
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
          href="/resumes"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
        >
          Resume library
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
        >
          All projects
          <ArrowRight size={16} />
        </Link>
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
          All docs
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
