import type { CollectionConfig } from 'payload';
import { canManageOwnerAdminCollection, readOwnerAdminCollection } from '../access';

export const inviteTokens: CollectionConfig = {
  slug: 'inviteTokens',
  admin: {
    useAsTitle: 'email',
    group: 'Auth',
    defaultColumns: ['email', 'role', 'expiresAt', 'acceptedAt', 'revokedAt'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
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
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Member', value: 'member' },
      ],
    },
    {
      name: 'tokenHash',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'SHA-256 hash of the plaintext token. Never stored in plaintext.',
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: { description: 'Set when the invite is consumed. Null = not yet accepted.' },
    },
    {
      name: 'revokedAt',
      type: 'date',
      admin: { description: 'Set when the invite is explicitly revoked by an operator.' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Operator who created this invite.' },
    },
  ],
};
