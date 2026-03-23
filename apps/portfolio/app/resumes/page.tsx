import type { Metadata } from 'next';
import { Download, ExternalLink, Printer } from 'lucide-react';
import { getResumes } from '@/lib/resumes';

export const metadata: Metadata = {
  title: 'Resumes | Ben Garrard',
  description: 'Find the tailored printable resumes and open each version as a standalone print-friendly page.',
};

export default function ResumesPage() {
  const resumes = getResumes();

  return (
    <div className="section-shell pb-16">
      <header className="story-card max-w-4xl p-8 md:p-10">
        <p className="section-kicker">Resumes</p>
        <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">Printable resume library</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
          Open any version as a standalone HTML page, print straight from the browser, or download the original source file from the same `misc/html_resumes` library the site reads from.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {resumes.map((resume) => (
          <article
            key={resume.slug}
            className="story-card flex h-full flex-col justify-between p-6 md:p-8"
          >
            <div>
              <p className="section-kicker">Standalone HTML</p>
              <h2 className="mt-2 font-display text-3xl text-primary">{resume.title}</h2>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-text-muted">{resume.role}</p>
              <p className="mt-5 text-base leading-7 text-text-muted">{resume.summary}</p>
              <p className="mt-4 font-mono text-xs text-text-muted/80">Source file: {resume.fileName}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`/resumes/${resume.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-secondary transition hover:opacity-90"
              >
                <ExternalLink size={16} />
                Open printable page
              </a>
              <a
                href={`/resumes/${resume.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition hover:border-accent hover:text-accent"
              >
                <Printer size={16} />
                Open here
              </a>
              <a
                href={`/resumes/${resume.slug}?download=1`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-5 py-3 text-sm font-medium text-primary transition hover:border-accent hover:text-accent"
              >
                <Download size={16} />
                Download HTML
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
