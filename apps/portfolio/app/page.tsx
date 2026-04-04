import { getAllContent } from '@/lib/content';
import { getBooks } from '@/lib/books';
import { getFeaturedBookShowcase } from '@/lib/featured-book';
import { getMusicTracks } from '@/lib/listen-runtime';
import CreativeHero from '@/components/home/CreativeHero';
import FeaturedBookExperience from '@/components/home/FeaturedBookExperience';
import SoundtrackSection from '@/components/home/SoundtrackSection';
import ArchiveGateway from '@/components/home/ArchiveGateway';
import HumanLoopPlanningSection from '@/components/home/HumanLoopPlanningSection';
import GetAnythingDoneSection from '@/components/home/GetAnythingDoneSection';

export default async function Home() {
  const blogPosts = getAllContent('blog');
  const docs = getAllContent('docs');
  const books = getBooks();
  const featuredBook = getFeaturedBookShowcase();
  const tracks = await getMusicTracks();

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
      <HumanLoopPlanningSection />
      <GetAnythingDoneSection />
      <SoundtrackSection tracks={tracks} />
      <ArchiveGateway
        blogCount={blogPosts.length}
        docCount={docs.length}
        latestPostTitle={blogPosts[0]?.meta.title}
        latestDocTitle={docs[0]?.meta.title}
      />
    </div>
  );
}
