import { notFound } from 'next/navigation';
import { getBookBySlug, getBooks } from '@/lib/books';
import ReaderWorkspace from '@/components/books/ReaderWorkspace';

export default async function ReaderAppPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string; record?: string; at?: string; cfi?: string }>;
}) {
  const { book, record, at, cfi } = await searchParams;
  const books = getBooks();

  if (!book) {
    return (
      <ReaderWorkspace
        books={books}
        initialRecordId={record}
        initialAt={at}
        initialCfi={cfi}
      />
    );
  }

  const bookEntry = getBookBySlug(book);
  if (!bookEntry?.hasEpub) notFound();

  return (
    <ReaderWorkspace
      books={books}
      initialBook={bookEntry}
      initialAt={at}
      initialCfi={cfi}
    />
  );
}
