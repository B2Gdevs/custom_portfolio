import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import TableOfContents from '@/components/docs/TableOfContents';
import { ContentTopLinks } from '@/components/content/ContentTopLinks';
import { RequiredSectionsNotice } from '@/components/content/RequiredSectionsNotice';
import { buildContentLinkGroups } from '@/lib/content-view-models';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const posts = getAllContent('blog');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getContentBySlug('blog', slug);

  if (!post) {
    notFound();
  }

  const components = getMDXComponents({});
  const heroImage = post.meta.featuredImage || post.meta.image;
  const galleryImages = post.meta.images || [];
  const linkGroups = buildContentLinkGroups(post.meta);

  return (
    <article className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
          <ArrowLeft size={16} />
          <span>Back to Blog</span>
        </Link>
      </div>

      {heroImage ? (
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-border/70 shadow-xl">
          <div className="relative h-80 w-full md:h-[480px]">
            <Image src={heroImage} alt={post.meta.title} fill className="object-cover" priority />
          </div>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-8">
          <header className="rounded-[2rem] border border-border/70 bg-dark-alt/60 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Blog</p>
            <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">{post.meta.title}</h1>
            {post.meta.date ? (
              <time className="mt-4 block text-sm text-text-muted">
                {format(new Date(post.meta.date), 'MMMM d, yyyy')}
              </time>
            ) : null}
            {post.meta.description ? (
              <p className="mt-4 max-w-3xl text-lg text-text-muted">{post.meta.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {(post.meta.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 px-3 py-1 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <ContentTopLinks
            heading="Downloads & Resources"
            appLinks={linkGroups.appLinks}
            downloads={linkGroups.downloads}
            links={linkGroups.links}
          />

          {process.env.NODE_ENV !== 'production' ? (
            <RequiredSectionsNotice type="blog" missing={post.missingRequiredSections} />
          ) : null}

          {galleryImages.length > 1 ? (
            <section className="rounded-[2rem] border border-border/70 bg-dark-alt/55 p-6">
              <h2 className="font-serif text-2xl text-primary">Gallery</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {galleryImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="group relative aspect-video overflow-hidden rounded-2xl border border-border shadow-md transition-shadow hover:shadow-xl"
                  >
                    <Image
                      src={img}
                      alt={`${post.meta.title} - Image ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="rounded-[2rem] border border-border/70 bg-dark-alt/40 p-6 sm:p-8">
            <div className="prose prose-lg max-w-none">
              <MDXRemote source={post.content} components={components} options={mdxOptions} />
            </div>
          </div>

          <div className="border-t border-border/70 pt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline">
              <ArrowLeft size={16} />
              <span>Back to Blog</span>
            </Link>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[2rem] border border-border/70 bg-dark-alt/60 p-5">
            <TableOfContents headings={post.headings} />
          </div>
        </aside>
      </div>
    </article>
  );
}

