import type { Access, CollectionConfig } from 'payload';
import { LISTEN_MEDIA_ASSET_COLLECTION_SLUG } from './listenMediaAssets';
import { canManageOwnerAdminCollection } from '../access';

export const LISTEN_CATALOG_RECORDS_COLLECTION_SLUG = 'listen-catalog-records';
const allowPublicRead: Access = () => true;

export const listenCatalogRecords: CollectionConfig = {
  slug: LISTEN_CATALOG_RECORDS_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Listen',
    defaultColumns: ['title', 'catalogKind', 'visibility', 'tenant', 'published', 'updatedAt'],
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
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'catalogKind',
      type: 'select',
      required: true,
      options: [
        { label: 'Track', value: 'track' },
        { label: 'Preset', value: 'preset' },
      ],
      index: true,
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
      index: true,
    },
    {
      name: 'genre',
      type: 'text',
      required: true,
    },
    {
      name: 'mood',
      type: 'text',
      required: true,
    },
    {
      name: 'era',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'bandlabUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'embedUrl',
      type: 'text',
    },
    {
      name: 'artworkAsset',
      type: 'relationship',
      relationTo: LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
    },
    {
      name: 'artworkUrl',
      type: 'text',
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
      index: true,
    },
    {
      name: 'extraTags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      index: true,
    },
  ],
};
