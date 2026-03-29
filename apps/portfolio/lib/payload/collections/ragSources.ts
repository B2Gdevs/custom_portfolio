import type { CollectionConfig } from 'payload';

export const ragSources: CollectionConfig = {
  slug: 'rag-sources',
  admin: {
    useAsTitle: 'title',
    group: 'RAG',
  },
  fields: [
    {
      name: 'sourceId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Doc', value: 'doc' },
        { label: 'Project', value: 'project' },
        { label: 'Blog', value: 'blog' },
        { label: 'Magicborn', value: 'magicborn' },
      ],
    },
    {
      name: 'scope',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
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
      name: 'checksum',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'lastContentUpdatedAt',
      type: 'date',
    },
    {
      name: 'lastIndexedAt',
      type: 'date',
    },
    {
      name: 'currentRunId',
      type: 'text',
      index: true,
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'meta',
      type: 'json',
    },
  ],
};
