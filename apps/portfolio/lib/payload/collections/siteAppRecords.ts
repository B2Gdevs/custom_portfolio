import type { Access, CollectionConfig } from 'payload';

export const SITE_APP_RECORD_COLLECTION_SLUG = 'site-app-records';

const allowPublicRead: Access = () => true;
const denyDirectWrites: Access = () => false;

export const siteAppRecords: CollectionConfig = {
  slug: SITE_APP_RECORD_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Site',
    defaultColumns: [
      'title',
      'slug',
      'routeHref',
      'featuredOrder',
      'published',
      'updatedAt',
    ],
  },
  access: {
    read: allowPublicRead,
    create: denyDirectWrites,
    update: denyDirectWrites,
    delete: denyDirectWrites,
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
      index: true,
    },
    {
      name: 'routeHref',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'iconName',
      type: 'select',
      required: true,
      options: [
        { label: 'Message Square', value: 'message-square' },
        { label: 'Terminal', value: 'terminal' },
        { label: 'Layers', value: 'layers' },
        { label: 'Book Open', value: 'book-open' },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'supportHref',
      type: 'text',
    },
    {
      name: 'supportLabel',
      type: 'text',
    },
    {
      name: 'supportText',
      type: 'textarea',
    },
    {
      name: 'exampleCode',
      type: 'text',
    },
    {
      name: 'featuredOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      index: true,
    },
    {
      name: 'downloads',
      type: 'relationship',
      relationTo: 'site-download-assets',
      hasMany: true,
    },
  ],
};
