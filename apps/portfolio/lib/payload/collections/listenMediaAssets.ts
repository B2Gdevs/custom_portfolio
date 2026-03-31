import type { Access, CollectionConfig } from 'payload';
import { resolvePortfolioAppPath } from '../app-root';

export const LISTEN_MEDIA_ASSET_COLLECTION_SLUG = 'listen-media-assets';

export function getListenMediaAssetFileURL(filename: string) {
  return `/api/${LISTEN_MEDIA_ASSET_COLLECTION_SLUG}/file/${encodeURIComponent(filename)}`;
}

const allowPublicRead: Access = () => true;
const denyDirectWrites: Access = () => false;

export const listenMediaAssets: CollectionConfig = {
  slug: LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Listen',
    defaultColumns: [
      'title',
      'listenSlug',
      'mediaRole',
      'mediaKind',
      'isCurrent',
      'updatedAt',
    ],
  },
  access: {
    read: allowPublicRead,
    create: denyDirectWrites,
    update: denyDirectWrites,
    delete: denyDirectWrites,
  },
  upload: {
    staticDir: resolvePortfolioAppPath('media', 'listen-media-assets'),
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
      name: 'listenSlug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      index: true,
    },
    {
      name: 'mediaRole',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Artwork', value: 'artwork' },
        { label: 'Gallery image', value: 'gallery-image' },
        { label: 'Downloadable', value: 'downloadable' },
        { label: 'Other', value: 'other' },
      ],
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
