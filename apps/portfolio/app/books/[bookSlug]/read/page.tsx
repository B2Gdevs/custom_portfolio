import { notFound } from 'next/navigation';
import { getBookBySlug } from '@/lib/books';
import RepubViewer from '@/components/books/RepubViewer';

export default async function BookReadPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = getBookBySlug(bookSlug);
  if (!book || !book.hasRepub) notFound();
  return <RepubViewer bookSlug={book.slug} bookTitle={book.title} />;
}
