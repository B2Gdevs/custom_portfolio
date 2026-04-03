import path from 'path';
import { fileURLToPath } from 'url';
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
import { bookSeries } from './lib/payload/collections/bookSeries';
import { bookRecords } from './lib/payload/collections/bookRecords';
import { sceneRecords } from './lib/payload/collections/sceneRecords';
import { sceneMediaVariants } from './lib/payload/collections/sceneMediaVariants';
import { projectRecords } from './lib/payload/collections/projectRecords';
import { resumeRecords } from './lib/payload/collections/resumeRecords';
import { tenants } from './lib/payload/collections/tenants';
import { users } from './lib/payload/collections/users';
import {
  getPayloadDatabaseAdapter,
  getPayloadPlugins,
} from './lib/payload/runtime-config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const ownerSeed = getOwnerSeedConfig();

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET?.trim() || 'dev-payload-secret',
  cookiePrefix: AUTH_COOKIE_PREFIX,
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
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
    bookSeries,
    bookRecords,
    sceneRecords,
    sceneMediaVariants,
    projectRecords,
    resumeRecords,
    readerLibraryAssets,
    readerLibraryRecords,
    readerReadingStates,
    readerSettings,
    ragSources,
    ragChunks,
    ragIngestRuns,
  ],
});
