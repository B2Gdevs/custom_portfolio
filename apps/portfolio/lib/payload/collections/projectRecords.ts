import type { Access, CollectionConfig, Field } from 'payload';
import { SITE_DOWNLOAD_ASSET_COLLECTION_SLUG } from './siteDownloadAssets';
import { canManageOwnerAdminCollection } from '../access';

export const PROJECT_RECORD_COLLECTION_SLUG = 'project-records';

const allowPublicRead: Access = () => true;

const linkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'href',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  {
    name: 'kind',
    type: 'text',
  },
  {
    name: 'external',
    type: 'checkbox',
    defaultValue: false,
  },
];

export const projectRecords: CollectionConfig = {
  slug: PROJECT_RECORD_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Site',
    defaultColumns: [
      'title',
      'slug',
      'featuredOrder',
      'status',
      'published',
      'updatedAt',
    ],
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
      name: 'description',
      type: 'textarea',
      required: true,
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
      name: 'updated',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
      index: true,
    },
    {
      name: 'status',
      type: 'text',
    },
    {
      name: 'featured',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'featuredOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
    },
    {
      name: 'tags',
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
      name: 'featuredImage',
      type: 'text',
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'githubUrl',
      type: 'text',
    },
    {
      name: 'liveUrl',
      type: 'text',
    },
    {
      name: 'appUrl',
      type: 'text',
    },
    {
      name: 'appLabel',
      type: 'text',
    },
    {
      name: 'appLinks',
      type: 'array',
      fields: linkFields,
    },
    {
      name: 'links',
      type: 'array',
      fields: linkFields,
    },
    {
      name: 'searchKeywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'media',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
            { label: 'External', value: 'external' },
            { label: 'Documentation', value: 'documentation' },
          ],
        },
        {
          name: 'src',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'thumbnail',
          type: 'text',
        },
      ],
    },
    {
      name: 'downloadAssets',
      type: 'relationship',
      relationTo: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
      hasMany: true,
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
