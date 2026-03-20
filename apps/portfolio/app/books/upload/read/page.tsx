import { getBooks } from '@/lib/books';
import ReaderWorkspace from '@/components/books/ReaderWorkspace';

export default function UploadedBookReadPage() {
  const books = getBooks();

  return <ReaderWorkspace books={books} />;
}
