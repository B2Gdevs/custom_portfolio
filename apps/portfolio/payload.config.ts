import { buildConfig } from 'payload';
import {
  AUTH_COOKIE_PREFIX,
  getOwnerSeedConfig,
  isLocalAutoLoginEnabled,
} from './lib/auth/config';
import { ragSources } from './lib/payload/collections/ragSources';
import { ragChunks } from './lib/payload/collections/ragChunks';
import { ragIngestRuns } from './lib/payload/collections/ragIngestRuns';
import { listenCatalogRecords } from './lib/payload/collections/listenCatalogRecords';
import { listenMediaAssets } from './lib/payload/collections/listenMediaAssets';
import { readerLibraryRecords } from './lib/payload/collections/readerLibraryRecords';
import { readerLibraryAssets } from './lib/payload/collections/readerLibraryAssets';
import { readerReadingStates } from './lib/payload/collections/readerReadingStates';
import { readerSettings } from './lib/payload/collections/readerSettings';
import { publishedBookArtifacts } from './lib/payload/collections/publishedBookArtifacts';
import { siteAppRecords } from './lib/payload/collections/siteAppRecords';
import { siteDownloadAssets } from './lib/payload/collections/siteDownloadAssets';
import { siteMediaAssets } from './lib/payload/collections/siteMediaAssets';
import { tenants } from './lib/payload/collections/tenants';
import { users } from './lib/payload/collections/users';
import {
  getPayloadDatabaseAdapter,
  getPayloadPlugins,
} from './lib/payload/runtime-config';

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
  db: getPayloadDatabaseAdapter(),
  plugins: getPayloadPlugins(),
  collections: [
    tenants,
    users,
    listenCatalogRecords,
    listenMediaAssets,
    publishedBookArtifacts,
    siteAppRecords,
    siteDownloadAssets,
    siteMediaAssets,
    readerLibraryAssets,
    readerLibraryRecords,
    readerReadingStates,
    readerSettings,
    ragSources,
    ragChunks,
    ragIngestRuns,
  ],
});
