import type { Access, CollectionConfig } from 'payload';
import { SITE_DOWNLOAD_ASSET_COLLECTION_SLUG } from './siteDownloadAssets';
import { canManageOwnerAdminCollection } from '../access';

export const RESUME_RECORD_COLLECTION_SLUG = 'resume-records';

const allowPublicRead: Access = () => true;

export const resumeRecords: CollectionConfig = {
  slug: RESUME_RECORD_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Site',
    defaultColumns: [
      'title',
      'slug',
      'featuredOrder',
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
      name: 'fileName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'featuredOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
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
