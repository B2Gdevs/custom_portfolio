import type { CollectionConfig } from 'payload';
import {
  canManageOwnerAdminCollection,
  readOwnerAdminCollection,
} from '../access';

export const tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Auth',
    defaultColumns: ['name', 'slug', 'isOwnerTenant', 'active'],
  },
  access: {
    read: readOwnerAdminCollection,
    create: canManageOwnerAdminCollection,
    update: canManageOwnerAdminCollection,
    delete: canManageOwnerAdminCollection,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isOwnerTenant',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      index: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      index: true,
    },
    {
      name: 'externalIds',
      type: 'group',
      admin: {
        description: 'External provider IDs for identity and billing systems.',
      },
      fields: [
        {
          name: 'clerkOrgId',
          type: 'text',
          unique: true,
          index: true,
          admin: {
            description: 'Clerk organization ID (org_xxx). Set when tenant is synced to Clerk.',
          },
        },
        {
          name: 'stripeAccountId',
          type: 'text',
          unique: true,
          index: true,
          admin: {
            description: 'Stripe connected account ID (acct_xxx). Set when billing is connected.',
          },
        },
      ],
    },
  ],
};
