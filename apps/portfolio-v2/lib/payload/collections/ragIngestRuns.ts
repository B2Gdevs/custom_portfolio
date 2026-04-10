import type { CollectionConfig } from 'payload';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const ragIngestRuns: CollectionConfig = {
  slug: 'rag-ingest-runs',
  admin: {
    useAsTitle: 'status',
    group: 'RAG',
    hidden: true,
    defaultColumns: ['status', 'isActive', 'indexedSourceCount', 'indexedChunkCount', 'updatedAt'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'running',
      index: true,
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'finishedAt',
      type: 'date',
    },
    {
      name: 'committedAt',
      type: 'date',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'indexedSourceCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'indexedChunkCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'reusedChunkCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'deletedSourceCount',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'triggeredBy',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'config',
      type: 'json',
    },
    {
      name: 'error',
      type: 'json',
    },
  ],
};
