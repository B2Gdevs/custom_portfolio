import type { Access, CollectionConfig } from 'payload';
import type { PublishedBookArtifactKind } from '@/lib/book-artifacts';
import { resolvePortfolioAppPath } from '../app-root';

export const PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG = 'published-book-artifacts';

export function getPublishedBookArtifactFileURL(filename: string) {
  return `/api/${PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG}/file/${encodeURIComponent(filename)}`;
}

const allowPublicRead: Access = () => true;
const denyDirectWrites: Access = () => false;

const publishedArtifactKindOptions: Array<{
  label: string;
  value: PublishedBookArtifactKind;
}> = [
  { label: 'EPUB', value: 'epub' },
  { label: 'Planning pack', value: 'planning-pack' },
];

export const publishedBookArtifacts: CollectionConfig = {
  slug: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Books',
    defaultColumns: [
      'title',
      'bookSlug',
      'artifactKind',
      'versionTag',
      'isCurrent',
      'updatedAt',
    ],
  },
  access: {
    read: allowPublicRead,
    create: denyDirectWrites,
    update: denyDirectWrites,
    delete: denyDirectWrites,
  },
  upload: {
    staticDir: resolvePortfolioAppPath('media', 'published-book-artifacts'),
    mimeTypes: ['application/epub+zip', 'application/zip', 'application/octet-stream'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'bookSlug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'artifactKind',
      type: 'select',
      required: true,
      index: true,
      options: publishedArtifactKindOptions,
    },
    {
      name: 'versionTag',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'checksumSha256',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'fileSizeBytes',
      type: 'number',
      required: true,
    },
    {
      name: 'sourceCommit',
      type: 'text',
    },
    {
      name: 'sourcePath',
      type: 'text',
    },
    {
      name: 'planningSourcePaths',
      type: 'json',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
  ],
};
