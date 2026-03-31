import type { Access, CollectionConfig } from 'payload';
import { resolvePortfolioAppPath } from '../app-root';

export const SITE_DOWNLOAD_ASSET_COLLECTION_SLUG = 'site-download-assets';

export function getSiteDownloadAssetFileURL(filename: string) {
  return `/api/${SITE_DOWNLOAD_ASSET_COLLECTION_SLUG}/file/${encodeURIComponent(filename)}`;
}

const allowPublicRead: Access = () => true;
const denyDirectWrites: Access = () => false;

export const siteDownloadAssets: CollectionConfig = {
  slug: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Site',
    defaultColumns: [
      'title',
      'downloadSlug',
      'downloadKind',
      'contentScope',
      'contentSlug',
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
    staticDir: resolvePortfolioAppPath('media', 'site-download-assets'),
    mimeTypes: [
      'application/pdf',
      'application/zip',
      'application/epub+zip',
      'text/html',
      'text/markdown',
      'application/json',
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
      name: 'downloadSlug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'downloadKind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Resume', value: 'resume' },
        { label: 'Planning Pack', value: 'planning-pack' },
        { label: 'App Bundle', value: 'app-bundle' },
        { label: 'Document', value: 'document' },
        { label: 'Archive', value: 'archive' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'contentScope',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Site', value: 'site' },
        { label: 'App', value: 'app' },
        { label: 'Project', value: 'project' },
        { label: 'Resume', value: 'resume' },
        { label: 'Book', value: 'book' },
      ],
    },
    {
      name: 'contentSlug',
      type: 'text',
      index: true,
    },
    {
      name: 'downloadLabel',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
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
      name: 'sourcePath',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
  ],
};
