import type { CollectionConfig } from 'payload';
import {
  AUTH_ENTITLEMENTS,
  AUTH_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/config';

export const users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: AUTH_SESSION_MAX_AGE_SECONDS,
    maxLoginAttempts: 10,
    verify: false,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Auth',
    defaultColumns: ['email', 'displayName', 'role', 'tenant'],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'owner',
      options: [{ label: 'Owner', value: 'owner' }],
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
