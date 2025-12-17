import { getAllContent } from '@/lib/content';
import BlogList from '@/components/blog/BlogList';

export default function BlogPage() {
  const posts = getAllContent('blog');

  return <BlogList posts={posts} />;
}

