import type { Access, CollectionConfig } from 'payload';
import { resolvePortfolioAppPath } from '../app-root';
import { canManageOwnerAdminCollection } from '../access';

export const SITE_MEDIA_ASSET_COLLECTION_SLUG = 'site-media-assets';

export function getSiteMediaAssetFileURL(filename: string) {
  return `/api/${SITE_MEDIA_ASSET_COLLECTION_SLUG}/file/${encodeURIComponent(filename)}`;
}

const allowPublicRead: Access = () => true;

export const siteMediaAssets: CollectionConfig = {
  slug: SITE_MEDIA_ASSET_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Media',
    defaultColumns: [
      'title',
      'sourcePath',
      'contentScope',
      'contentSlug',
      'mediaKind',
      'isCurrent',
      'updatedAt',
    ],
  },
  access: {
    read: allowPublicRead,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  upload: {
    staticDir: resolvePortfolioAppPath('media', 'site-media-assets'),
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'application/zip',
      'application/octet-stream',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'contentScope',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Project', value: 'project' },
        { label: 'Blog', value: 'blog' },
        { label: 'Open Graph', value: 'og' },
        { label: 'Home', value: 'home' },
        { label: 'Brand', value: 'brand' },
        { label: 'Site', value: 'site' },
      ],
    },
    {
      name: 'contentSlug',
      type: 'text',
      index: true,
    },
    {
      name: 'mediaKind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Document', value: 'document' },
        { label: 'Other', value: 'other' },
      ],
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
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
  ],
};
