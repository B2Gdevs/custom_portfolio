import type { CollectionConfig } from 'payload';
import { READER_LIBRARY_ASSET_COLLECTION_SLUG } from './readerLibraryAssets';

export const readerLibraryRecords: CollectionConfig = {
  slug: 'reader-library-records',
  admin: {
    useAsTitle: 'title',
    group: 'Reader',
    defaultColumns: ['title', 'sourceKind', 'visibility', 'tenant', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'bookSlug',
      type: 'text',
      index: true,
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'coverImageUrl',
      type: 'text',
    },
    {
      name: 'epubAsset',
      type: 'relationship',
      relationTo: READER_LIBRARY_ASSET_COLLECTION_SLUG,
    },
    {
      name: 'epubUrl',
      type: 'text',
    },
    {
      name: 'sourceKind',
      type: 'select',
      required: true,
      defaultValue: 'uploaded',
      options: [
        { label: 'Built-in', value: 'built-in' },
        { label: 'Uploaded', value: 'uploaded' },
      ],
      index: true,
    },
    {
      name: 'sourceFileName',
      type: 'text',
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Public', value: 'public' },
      ],
      index: true,
    },
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
