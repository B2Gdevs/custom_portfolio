import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import { format } from 'date-fns';
import Link from 'next/link';

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

  const components = useMDXComponents({});

  return (
    <article className="max-w-4xl mx-auto px-6 py-20">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">{post.meta.title}</h1>
        {post.meta.date && (
          <time className="text-text-muted text-lg block mb-4">
            {format(new Date(post.meta.date), 'MMMM d, yyyy')}
          </time>
        )}
        {post.meta.description && (
          <p className="text-xl text-text-muted mb-6">{post.meta.description}</p>
        )}
        {post.meta.tags && (
          <div className="flex gap-2 flex-wrap">
            {post.meta.tags.map((tag) => (
              <span
                key={tag}
                className="brutal-border bg-dark-alt px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div className="prose prose-lg max-w-none">
        <MDXRemote source={post.content} components={components} options={mdxOptions} />
      </div>
      
      <div className="mt-12 pt-8 border-t-4 border-primary">
        <Link
          href="/blog"
          className="text-accent font-semibold hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}

