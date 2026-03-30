import type { CollectionConfig } from 'payload';
import { resolvePortfolioAppPath } from '../app-root';

export const READER_LIBRARY_ASSET_COLLECTION_SLUG = 'reader-library-assets';

export const readerLibraryAssets: CollectionConfig = {
  slug: READER_LIBRARY_ASSET_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'filename',
    group: 'Reader',
    defaultColumns: ['filename', 'mimeType', 'tenant', 'uploadedBy', 'updatedAt'],
  },
  upload: {
    staticDir: resolvePortfolioAppPath('media', 'reader-library'),
    mimeTypes: ['application/epub+zip', 'application/zip', 'application/octet-stream'],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
  ],
};
