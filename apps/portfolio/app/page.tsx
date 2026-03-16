import { getAllContent } from '@/lib/content';
import { getBooks } from '@/lib/books';
import { getFeaturedBookShowcase } from '@/lib/featured-book';
import { getMusicTracks } from '@/lib/music';
import { getResumes } from '@/lib/resumes';
import CreativeHero from '@/components/home/CreativeHero';
import FeaturedBookExperience from '@/components/home/FeaturedBookExperience';
import SoundtrackSection from '@/components/home/SoundtrackSection';
import ArchiveGateway from '@/components/home/ArchiveGateway';

export default async function Home() {
  const projects = getAllContent('projects');
  const blogPosts = getAllContent('blog');
  const docs = getAllContent('docs');
  const books = getBooks();
  const featuredBook = getFeaturedBookShowcase();
  const tracks = getMusicTracks();
  const resumes = getResumes();

  if (!featuredBook) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="story-card p-8 md:p-10">
          <p className="section-kicker">Featured reading unavailable</p>
          <h1 className="mt-2 font-display text-4xl text-primary md:text-6xl">
            The site is ready for a book-first landing page.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
            The home page expects a built book manifest with a featured title. Run the books pipeline, then this landing page can surface the reader directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CreativeHero featuredBook={featuredBook} />
      <FeaturedBookExperience featuredBook={featuredBook} books={books} />
      <SoundtrackSection tracks={tracks} />
      <ArchiveGateway
        resumeCount={resumes.length}
        projectCount={projects.length}
        blogCount={blogPosts.length}
        docCount={docs.length}
        featuredResumeTitle={resumes[0]?.title}
        featuredProjectTitle={projects[0]?.meta.title}
        latestPostTitle={blogPosts[0]?.meta.title}
        latestDocTitle={docs[0]?.meta.title}
      />
    </div>
  );
}
