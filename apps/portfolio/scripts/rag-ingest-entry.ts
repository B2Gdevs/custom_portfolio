/**
 * Bundled entry for `rag-ingest-runner.cjs`. Rich CLI output is in `lib/rag/ingest-cli.ts`.
 */
process.env.RAG_INGEST_CLI = '1';

import { getPayloadClient } from '@/lib/payload';
import { getRagVectorStore } from '../lib/rag/config';
import { printRagIngestCliExitBanner } from '../lib/rag/ingest-cli';
import { ingestRagCorpus } from '../lib/rag/ingest';
import { endRagSearchPgPool } from '../lib/rag/search-pg';

async function shutdownConnections(): Promise<void> {
  if (getRagVectorStore() === 'postgres') {
    await endRagSearchPgPool();
  }
  try {
    const payload = await getPayloadClient();
    await payload.destroy();
  } catch {
    /* Payload may not have initialized */
  }
}

async function run(): Promise<void> {
  try {
    await ingestRagCorpus({
      triggeredBy: 'script',
      verboseCli: true,
    });
  } finally {
    await shutdownConnections();
  }
}

run()
  .then(() => {
    printRagIngestCliExitBanner('success');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    printRagIngestCliExitBanner('failure');
    process.exit(1);
  });
