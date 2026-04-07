import { notFound } from 'next/navigation';
import { getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import Image from 'next/image';
import ProjectMediaSidebar from '@/components/projects/ProjectMediaSidebar';
import TableOfContents from '@/components/docs/TableOfContents';
import { ContentBackLink } from '@/components/content/ContentBackLink';
import { ContentGallerySection } from '@/components/content/ContentGallerySection';
import { ContentTopLinks } from '@/components/content/ContentTopLinks';
import { RequiredSectionsNotice } from '@/components/content/RequiredSectionsNotice';
import { buildContentLinkGroups } from '@/lib/content-view-models';
import { getProjectBySlug } from '@/lib/projects';

export async function generateStaticParams() {
  const projects = getAllContent('projects');
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const components = getMDXComponents({});
  const heroImage = project.meta.featuredImage || project.meta.images?.[0];
  const galleryImages = project.meta.images || [];
  const linkGroups = buildContentLinkGroups(project.meta);

  type MediaItemInput = { type?: string; url?: string } & Record<string, unknown>;
  const mediaItems = ((project.meta.media || []) as unknown as MediaItemInput[]).map((item: MediaItemInput) => {
    if (item.type === 'video' && item.url) {
      let embedUrl = item.url;
      try {
        if (item.url.includes('youtube.com/watch') || item.url.includes('youtu.be/')) {
          const urlObj = new URL(item.url);
          let videoId: string | null = null;
          let timestamp: string | null = null;

          if (item.url.includes('youtube.com/watch')) {
            videoId = urlObj.searchParams.get('v');
            timestamp = urlObj.searchParams.get('t');
          } else if (item.url.includes('youtu.be/')) {
            videoId = urlObj.pathname.split('/').pop() || null;
            timestamp = urlObj.searchParams.get('t');
          }

          if (videoId) {
            let startParam = '';
            if (timestamp) {
              const seconds = timestamp.replace(/[^0-9]/g, '');
              if (seconds) {
                startParam = `?start=${seconds}`;
              }
            }
            embedUrl = `https://www.youtube.com/embed/${videoId}${startParam}`;
          }
        }
      } catch {
        console.warn('Failed to parse video URL:', item.url);
      }
      return { ...item, url: embedUrl };
    }
    return item;
  });

  return (
    <article className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6">
        <ContentBackLink href="/projects">Back to Projects</ContentBackLink>
      </div>

      {heroImage ? (
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-border shadow-xl">
          <div className="relative h-80 w-full md:h-[500px]">
            <Image
              src={heroImage}
              alt={project.meta.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem_22rem]">
        <div className="min-w-0 space-y-8 xl:col-span-2">
          <header className="rounded-[2rem] border border-border/70 bg-dark-alt/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Project</p>
            <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">{project.meta.title}</h1>
            {project.meta.description ? (
              <p className="mt-4 max-w-3xl text-lg text-text-muted">{project.meta.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {(project.meta.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 px-3 py-1 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
              {project.meta.status ? (
                <span className="rounded-full border border-accent/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
                  {project.meta.status}
                </span>
              ) : null}
            </div>
          </header>

          <ContentTopLinks
            heading="Links & Downloads"
            appLinks={linkGroups.appLinks}
            downloads={linkGroups.downloads}
            links={linkGroups.links}
          />

          {process.env.NODE_ENV !== 'production' ? (
            <RequiredSectionsNotice type="projects" missing={project.missingRequiredSections} />
          ) : null}

          <ContentGallerySection
            images={galleryImages}
            altPrefix={project.meta.title}
            variant="projects"
          />

          <div className="rounded-[2rem] border border-border/70 bg-dark-alt/40 p-6 sm:p-8">
            <div className="prose prose-lg max-w-none">
              <MDXRemote source={project.content} components={components} options={mdxOptions} />
            </div>
          </div>

          <div className="border-t border-border/70 pt-8">
            <ContentBackLink href="/projects">Back to Projects</ContentBackLink>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-[2rem] border border-border/70 bg-dark-alt/60 p-5">
            <TableOfContents headings={project.headings} />
          </div>
        </aside>

        <div className="xl:col-span-1">
          <ProjectMediaSidebar
            mediaItems={mediaItems as { type: 'image' | 'video' | 'external' | 'documentation'; src?: string; url?: string; title?: string; thumbnail?: string }[]}
            galleryImages={galleryImages}
            projectTitle={project.meta.title}
          />
        </div>
      </div>
    </article>
  );
}

