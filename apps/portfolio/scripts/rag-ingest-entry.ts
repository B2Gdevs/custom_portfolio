import { ingestRagCorpus } from '../lib/rag/ingest';

async function main() {
  const summary = await ingestRagCorpus({
    triggeredBy: 'script',
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
