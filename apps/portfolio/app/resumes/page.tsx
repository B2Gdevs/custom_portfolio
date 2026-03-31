import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Download, ExternalLink, Eye, FileText, Printer } from 'lucide-react';
import { assertResumeOwnerOrRedirect } from '@/lib/auth/resume-owner-gate';
import { getResumes } from '@/lib/resumes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Resumes | Ben Garrard',
  description: 'Browse printable HTML resumes in a preview gallery and open, print, or download each version.',
};

function ResumeAction({
  href,
  label,
  icon,
  external,
  download,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  download?: string;
}) {
  const className =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-[rgba(16,12,10,0.84)] text-[#f3e8d8] backdrop-blur transition hover:border-[rgba(213,176,131,0.5)] hover:text-white';

  const content = external ? (
    <a href={href} target="_blank" rel="noreferrer" download={download} className={className}>
      {icon}
    </a>
  ) : (
    <Link href={href} download={download} className={className}>
      {icon}
    </Link>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={content} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default async function ResumesPage() {
  await assertResumeOwnerOrRedirect();

  const resumes = getResumes();

  return (
    <div className="section-shell pb-16">
      <header className="story-card max-w-5xl p-8 md:p-10">
        <p className="section-kicker">Resumes</p>
        <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">Preview gallery</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
          Each resume is sourced from the HTML library and previewed like a printable artifact. Hover a card to open,
          print, or download it directly.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <article
            key={resume.slug}
            className="group overflow-hidden rounded-[2rem] border border-border/70 bg-dark-alt/55 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:border-accent/45"
          >
            <div className="relative border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-border/70 bg-white shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
                <iframe
                  src={`/resumes/${resume.slug}`}
                  title={`${resume.title} preview`}
                  className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0 bg-white"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(15,10,8,0.9)] to-transparent opacity-75" />
              </div>

              <div className="absolute inset-x-6 top-6 flex justify-end gap-2 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                <ResumeAction
                  href={`/resumes/${resume.slug}`}
                  label="Open here"
                  icon={<Eye size={16} />}
                />
                <ResumeAction
                  href={`/resumes/${resume.slug}`}
                  label="Open printable page"
                  icon={<ExternalLink size={16} />}
                  external
                />
                <ResumeAction
                  href={`/resumes/${resume.slug}?download=1`}
                  label="Print/download HTML"
                  icon={<Printer size={16} />}
                  external
                />
                <ResumeAction
                  href={`/resumes/download/${resume.slug}`}
                  label="Download source HTML"
                  icon={<Download size={16} />}
                  external
                  download={resume.fileName}
                />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-dark text-accent">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-primary">{resume.title}</h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-text-muted">{resume.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-text-muted">{resume.summary}</p>
              <p className="mt-4 font-mono text-[0.7rem] text-text-muted/80">{resume.fileName}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
