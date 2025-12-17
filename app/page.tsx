import { getAllContent } from '@/lib/content';
import Hero from '@/components/home/Hero';
import FeaturedProjectsHeader from '@/components/home/FeaturedProjectsHeader';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import LatestBlogPost from '@/components/home/LatestBlogPost';
import { getPCBPattern, getPCBPatternPath } from '@/lib/pcb-patterns';

export default async function Home() {
  const projects = getAllContent('projects');
  const blogPosts = getAllContent('blog');
  
  // Get featured projects (first 2)
  const featuredProjects = projects.slice(0, 2);
  
  // Get latest blog post
  const latestBlogPost = blogPosts[0] || null;

  // Alternate PCB patterns per row (0 = Featured Projects, 1 = Latest Blog Post)
  const featuredProjectsPattern = getPCBPattern(0); // 'grid'
  const blogPostPattern = getPCBPattern(1); // 'curves'

  return (
    <div className="w-full bg-dark">
      <Hero />

      {/* Featured Projects - Modern Card Layout */}
      <section className="w-full relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${getPCBPatternPath(featuredProjectsPattern)}")`,
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '500px 400px',
            opacity: 0.5,
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative z-10">
          <div className="max-w-5xl mx-auto">
            <FeaturedProjectsHeader />
            <FeaturedProjects projects={featuredProjects} />
          </div>
        </div>
      </section>

      <LatestBlogPost post={latestBlogPost} pattern={blogPostPattern} />
    </div>
  );
}
