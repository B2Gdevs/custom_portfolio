import type { CollectionConfig } from 'payload';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const ragChunks: CollectionConfig = {
  slug: 'rag-chunks',
  admin: {
    useAsTitle: 'vectorKey',
    group: 'RAG',
    hidden: true,
    defaultColumns: ['vectorKey', 'sourceExternalId', 'chunkIndex', 'heading', 'isActive'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'vectorKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'rag-sources',
      required: true,
      index: true,
    },
    {
      name: 'run',
      type: 'relationship',
      relationTo: 'rag-ingest-runs',
      required: true,
      index: true,
    },
    {
      name: 'sourceExternalId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourceTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceKind',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceScope',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceSlug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourcePath',
      type: 'text',
      required: true,
    },
    {
      name: 'publicUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'chunkIndex',
      type: 'number',
      required: true,
      index: true,
    },
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'anchor',
      type: 'text',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tokenCount',
      type: 'number',
      required: true,
    },
    {
      name: 'contentChecksum',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'embeddingModel',
      type: 'text',
      required: true,
    },
    {
      name: 'embeddingDimensions',
      type: 'number',
      required: true,
    },
    {
      name: 'embedding',
      type: 'json',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
  ],
};
