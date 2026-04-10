import type { Access, CollectionConfig } from 'payload';
import { BOOK_SERIES_COLLECTION_SLUG } from './bookSeries';
import { canManageOwnerAdminCollection } from '../access';

export const BOOK_RECORD_COLLECTION_SLUG = 'book-records';

const allowPublicRead: Access = () => true;

export const bookRecords: CollectionConfig = {
  slug: BOOK_RECORD_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Books',
    defaultColumns: ['title', 'slug', 'series', 'sortOrder', 'updatedAt'],
  },
  access: {
    read: allowPublicRead,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: BOOK_SERIES_COLLECTION_SLUG,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
    {
      name: 'synopsis',
      type: 'textarea',
    },
  ],
};
