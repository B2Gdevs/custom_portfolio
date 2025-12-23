import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProjectMediaSidebar from '@/components/projects/ProjectMediaSidebar';

export async function generateStaticParams() {
  const projects = getAllContent('projects');
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getContentBySlug('projects', slug);

  if (!project) {
    notFound();
  }

  const components = useMDXComponents({});

  const heroImage = project.meta.featuredImage || project.meta.images?.[0];
  const galleryImages = project.meta.images || [];
  
  // Parse media items from metadata
  const mediaItems = (project.meta.media || []).map((item: any) => {
    if (item.type === 'video' && item.url) {
      // Convert YouTube URL to embed format
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
            // Convert timestamp from '302s' format to seconds number
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
      } catch (e) {
        // If URL parsing fails, keep original URL
        console.warn('Failed to parse video URL:', item.url);
      }
      return { ...item, url: embedUrl };
    }
    return item;
  });

  return (
    <article className="max-w-7xl mx-auto px-6 py-20">
      {/* Hero Image */}
      {heroImage && (
        <div className="mb-12 rounded-xl overflow-hidden border border-border shadow-xl">
          <div className="relative w-full h-96 md:h-[500px]">
            <Image
              src={heroImage}
              alt={project.meta.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <header className="mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">{project.meta.title}</h1>
        {project.meta.description && (
          <p className="text-xl text-text-muted mb-6">{project.meta.description}</p>
        )}
        <div className="flex gap-4 flex-wrap">
          {project.meta.githubUrl && (
            <a
              href={project.meta.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-button px-4 py-2 bg-secondary text-primary flex items-center gap-2"
            >
              <Github size={20} />
              GitHub
            </a>
          )}
          {project.meta.liveUrl && (
            <a
              href={project.meta.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-button px-4 py-2 bg-accent text-secondary flex items-center gap-2"
            >
              <ExternalLink size={20} />
              Live Demo
            </a>
          )}
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          {galleryImages.length > 1 && (
            <div className="mb-12" data-gallery-container>
              <h2 className="text-2xl font-bold text-primary mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    data-gallery-image
                    className="relative aspect-video rounded-lg overflow-hidden border border-border shadow-md hover:shadow-xl transition-shadow group cursor-pointer"
                  >
                    <Image
                      src={img}
                      alt={`${project.meta.title} - Image ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="prose prose-lg max-w-none">
            <MDXRemote source={project.content} components={components} options={mdxOptions} />
          </div>
          
          <div className="mt-12 pt-8 border-t-4 border-primary">
            <Link
              href="/projects"
              className="text-accent font-semibold hover:underline"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:col-span-1">
          <ProjectMediaSidebar
            mediaItems={mediaItems}
            galleryImages={galleryImages}
            projectTitle={project.meta.title}
          />
        </div>
      </div>
    </article>
  );
}

