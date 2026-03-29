import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { ragSources } from './lib/payload/collections/ragSources';
import { ragChunks } from './lib/payload/collections/ragChunks';
import { ragIngestRuns } from './lib/payload/collections/ragIngestRuns';
import { getPayloadDatabaseUrl } from './lib/rag/config';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET?.trim() || 'dev-payload-secret',
  db: sqliteAdapter({
    client: {
      url: getPayloadDatabaseUrl(),
    },
  }),
  collections: [ragSources, ragChunks, ragIngestRuns],
});
