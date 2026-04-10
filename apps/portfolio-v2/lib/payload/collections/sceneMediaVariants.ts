import type { Access, CollectionConfig } from 'payload';
import { SCENE_RECORD_COLLECTION_SLUG } from './sceneRecords';
import { SITE_MEDIA_ASSET_COLLECTION_SLUG } from './siteMediaAssets';
import { canManageOwnerAdminCollection } from '../access';

export const SCENE_MEDIA_VARIANT_COLLECTION_SLUG = 'scene-media-variants';

const allowPublicRead: Access = () => true;

export const sceneMediaVariants: CollectionConfig = {
  slug: SCENE_MEDIA_VARIANT_COLLECTION_SLUG,
  admin: {
    useAsTitle: 'label',
    group: 'Books',
    defaultColumns: ['label', 'scene', 'variantType', 'status', 'updatedAt'],
  },
  access: {
    read: allowPublicRead,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'scene',
      type: 'relationship',
      relationTo: SCENE_RECORD_COLLECTION_SLUG,
      required: true,
      index: true,
    },
    {
      name: 'variantType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Scene play', value: 'scenePlay' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Ready', value: 'ready' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'imagePrompt',
      type: 'textarea',
    },
    {
      name: 'videoPrompt',
      type: 'textarea',
    },
    {
      name: 'outputAsset',
      type: 'relationship',
      relationTo: SITE_MEDIA_ASSET_COLLECTION_SLUG,
    },
  ],
};
