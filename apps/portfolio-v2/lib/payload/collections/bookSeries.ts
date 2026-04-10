import type { Access, CollectionConfig } from 'payload';
import { canManageOwnerAdminCollection } from '../access';

export const BOOK_SERIES_COLLECTION_SLUG = 'book-series';

const allowPublicRead: Access = () => true;

export const bookSeries: CollectionConfig = {
  slug: BOOK_SERIES_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Books',
    defaultColumns: ['title', 'slug', 'sortOrder', 'updatedAt'],
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
