import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import {
  AUTH_COOKIE_PREFIX,
  getOwnerSeedConfig,
  isLocalAutoLoginEnabled,
} from './lib/auth/config';
import { ragSources } from './lib/payload/collections/ragSources';
import { ragChunks } from './lib/payload/collections/ragChunks';
import { ragIngestRuns } from './lib/payload/collections/ragIngestRuns';
import { readerLibraryRecords } from './lib/payload/collections/readerLibraryRecords';
import { readerReadingStates } from './lib/payload/collections/readerReadingStates';
import { readerSettings } from './lib/payload/collections/readerSettings';
import { tenants } from './lib/payload/collections/tenants';
import { users } from './lib/payload/collections/users';
import { getPayloadDatabaseUrl } from './lib/rag/config';

const ownerSeed = getOwnerSeedConfig();

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET?.trim() || 'dev-payload-secret',
  cookiePrefix: AUTH_COOKIE_PREFIX,
  admin: {
    user: 'users',
    autoRefresh: true,
    autoLogin: isLocalAutoLoginEnabled()
      ? {
          email: ownerSeed.email,
          password: ownerSeed.password,
        }
      : false,
  },
  db: sqliteAdapter({
    client: {
      url: getPayloadDatabaseUrl(),
    },
  }),
  collections: [
    tenants,
    users,
    readerLibraryRecords,
    readerReadingStates,
    readerSettings,
    ragSources,
    ragChunks,
    ragIngestRuns,
  ],
});
