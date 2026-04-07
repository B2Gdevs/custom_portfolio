import { unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { getPayloadClient } from '@/lib/payload';

async function main() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'resume-records',
    depth: 1,
    limit: 100,
    sort: 'featuredOrder',
    where: {
      published: {
        equals: true,
      },
    },
  });

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        resumes: result.docs,
      },
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
