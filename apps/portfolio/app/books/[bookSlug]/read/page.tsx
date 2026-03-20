import { notFound } from 'next/navigation';
import { getBookBySlug, getBooks } from '@/lib/books';
import ReaderWorkspace from '@/components/books/ReaderWorkspace';

export default async function BookReadPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = getBookBySlug(bookSlug);
  const books = getBooks();
  if (!book || !book.hasEpub) notFound();

  return <ReaderWorkspace books={books} initialBook={book} />;
}
