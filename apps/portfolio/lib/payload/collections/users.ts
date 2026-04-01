import type { CollectionConfig } from 'payload';
import {
  AUTH_ENTITLEMENTS,
  AUTH_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/config';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: AUTH_SESSION_MAX_AGE_SECONDS,
    maxLoginAttempts: 10,
    verify: false,
    /** Per-user API keys for REST/GraphQL (`users API-Key …`); operator CLI can mint/store in `.magicborn/` (see Payload docs). */
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Auth',
    defaultColumns: ['email', 'displayName', 'role', 'tenant'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'avatarUrl',
      type: 'text',
      admin: {
        description: 'Absolute URL or site-relative image path for the owner account avatar.',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'owner',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Admin', value: 'admin' },
        { label: 'Member', value: 'member' },
      ],
      index: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'entitlements',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Reader sync', value: AUTH_ENTITLEMENTS.readerSync },
        { label: 'Reader edit', value: AUTH_ENTITLEMENTS.readerEdit },
        { label: 'Reader upload', value: AUTH_ENTITLEMENTS.readerUpload },
        { label: 'Listen private', value: AUTH_ENTITLEMENTS.listenPrivate },
        { label: 'Admin access', value: AUTH_ENTITLEMENTS.adminAccess },
      ],
      defaultValue: [
        AUTH_ENTITLEMENTS.readerSync,
        AUTH_ENTITLEMENTS.readerEdit,
        AUTH_ENTITLEMENTS.readerUpload,
        AUTH_ENTITLEMENTS.listenPrivate,
        AUTH_ENTITLEMENTS.adminAccess,
      ],
    },
  ],
};
