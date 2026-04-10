import type { CollectionConfig } from 'payload';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const readerReadingStates: CollectionConfig = {
  slug: 'reader-reading-states',
  admin: {
    useAsTitle: 'storageKey',
    group: 'Reader',
    hidden: true,
    defaultColumns: ['storageKey', 'bookSlug', 'user', 'tenant', 'updatedAt'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'storageKey',
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
      name: 'contentHash',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourceKind',
      type: 'select',
      required: true,
      defaultValue: 'built-in',
      options: [
        { label: 'Built-in', value: 'built-in' },
        { label: 'Uploaded', value: 'uploaded' },
      ],
      index: true,
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 1,
    },
    {
      name: 'annotations',
      type: 'json',
      required: true,
      defaultValue: [],
    },
  ],
};
