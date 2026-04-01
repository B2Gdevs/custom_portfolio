import fs from 'fs';
import path from 'path';
import { getBookBySlug } from '@/lib/books';

export interface FeaturedBookShowcase {
  slug: string;
  title: string;
  author: string;
  description: string;
  chapterCount: number;
  pageCount: number;
  status: string;
  heroEyebrow: string;
  heroSummary: string;
  worldIntro: string;
  worldDetails: string[];
}

function resolveBooksRoot(): string | null {
  const candidates = [
    path.join(process.cwd(), 'books'),
    path.join(process.cwd(), '..', '..', 'books'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function getFeaturedBookShowcase(slug = 'mordreds_tale'): FeaturedBookShowcase | null {
  const book = getBookBySlug(slug);

  if (!book) {
    return null;
  }

  const booksRoot = resolveBooksRoot();
  const bookDir = booksRoot ? path.join(booksRoot, slug) : null;
  const chaptersDir = bookDir ? path.join(bookDir, 'chapters') : null;
  const metadataPath = bookDir ? path.join(bookDir, 'book.json') : null;

  let author = 'Ben Garrard';
  let chapterCount = 0;
  let pageCount = 0;

  if (metadataPath && fs.existsSync(metadataPath)) {
    try {
      const raw = fs.readFileSync(metadataPath, 'utf-8');
      const parsed = JSON.parse(raw) as { author?: string };
      if (parsed.author) {
        author = parsed.author;
      }
    } catch {
      // Fall back to default author if book metadata is malformed.
    }
  }

  if (chaptersDir && fs.existsSync(chaptersDir)) {
    const chapterEntries = fs.readdirSync(chaptersDir, { withFileTypes: true });
    const chapterDirs = chapterEntries.filter((entry) => entry.isDirectory());

    chapterCount = chapterDirs.length;

    for (const chapterDir of chapterDirs) {
      const fullChapterPath = path.join(chaptersDir, chapterDir.name);
      const chapterFiles = fs.readdirSync(fullChapterPath, { withFileTypes: true });
      pageCount += chapterFiles.filter((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name)).length;
    }
  }

  return {
    slug,
    title: book.title,
    author,
    description: book.description ?? 'A dark fantasy novel of bloodlines, hunger, and inherited ruin.',
    chapterCount,
    pageCount,
    status: 'EPUB preview live now',
    heroEyebrow: 'A dark fantasy world is opening here first.',
    heroSummary:
      '',
    worldIntro:
      'Mordred\'s Tale lives between myth and street-level survival: cursed bloodlines, old magic, scavenged relics, and people trying to stay human while power keeps asking for more.',
    worldDetails: [
      'Morgana a Sleeping Goddess, Jack a criminal, and a world without magic which it had always known, sets the stage for beings called Magicborn.',
      'Mordred, the first of the Magicborn.  Eventually the known as the Untamed.  Will be forever known as the first and strongest setting the rule of the world and the place where other Magicborn live in it.',
      'Mordred with the help of Morgana condemns his own kind, oppressing them for the greater good even if it is ruthless.',
    ],
  };
}
