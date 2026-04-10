import type { Access, CollectionConfig } from 'payload';
import { BOOK_RECORD_COLLECTION_SLUG } from './bookRecords';
import { canManageOwnerAdminCollection } from '../access';

export const SCENE_RECORD_COLLECTION_SLUG = 'scene-records';

const allowPublicRead: Access = () => true;

export const sceneRecords: CollectionConfig = {
  slug: SCENE_RECORD_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'title',
    group: 'Books',
    defaultColumns: ['title', 'slug', 'book', 'sortIndex', 'updatedAt'],
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
      index: true,
    },
    {
      name: 'book',
      type: 'relationship',
      relationTo: BOOK_RECORD_COLLECTION_SLUG,
      required: true,
      index: true,
    },
    {
      name: 'sortIndex',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    /** Structured beat / blocking for advanced video (global-tooling-06-04). */
    {
      name: 'scenePlayText',
      type: 'textarea',
      admin: { description: 'Blocking / beat text for scene-play video composition' },
    },
    /** Placeholder until a video provider is chosen. */
    {
      name: 'videoPromptStub',
      type: 'textarea',
      admin: { description: 'Draft video prompt; generation provider TBD' },
    },
  ],
};
