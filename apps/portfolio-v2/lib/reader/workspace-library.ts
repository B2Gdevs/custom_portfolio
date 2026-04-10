import type { ReaderBookEntry } from '@/lib/reader-ui/types';
import type { BookEntry } from '@/lib/books';
import type { ReaderLibraryRecord } from './workspace-contract';

export function mapWorkspaceLibraryRecordsToReaderBooks(
  records: ReaderLibraryRecord[],
): ReaderBookEntry[] {
  return records.map((record) => ({
    slug: `uploaded-record-${record.id}`,
    recordId: record.id,
    title: record.title,
    author: record.author ?? undefined,
    description: record.description ?? undefined,
    coverImage: record.coverImageUrl ?? undefined,
    remoteEpubUrl: record.epubUrl ?? undefined,
    sourceKind: 'uploaded',
    visibility: record.visibility,
    genres: [record.visibility === 'public' ? 'Public upload' : 'Private upload'],
    hasEpub: Boolean(record.epubUrl),
  }));
}

export function resolveInitialReaderBook(input: {
  uploadedBooks: ReaderBookEntry[];
  initialBook?: BookEntry;
  initialRecordId?: string;
}): ReaderBookEntry | undefined {
  if (input.initialBook) {
    return input.initialBook;
  }

  if (!input.initialRecordId) {
    return undefined;
  }

  return input.uploadedBooks.find((book) => book.recordId === input.initialRecordId);
}
