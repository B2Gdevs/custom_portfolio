import type { CollectionConfig } from 'payload';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const readerSettings: CollectionConfig = {
  slug: 'reader-settings',
  admin: {
    useAsTitle: 'id',
    group: 'Reader',
    hidden: true,
    defaultColumns: ['user', 'tenant', 'defaultWorkspaceView', 'updatedAt'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'defaultWorkspaceView',
      type: 'select',
      required: true,
      defaultValue: 'library',
      options: [
        { label: 'Library', value: 'library' },
        { label: 'Continue reading', value: 'continue-reading' },
      ],
    },
    {
      name: 'preferPagedReader',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'showProgressBadges',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
  ],
};
