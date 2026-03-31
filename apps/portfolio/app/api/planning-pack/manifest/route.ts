import { getPlanningPackManifest } from '@/lib/planning-pack-assets';

export const runtime = 'nodejs';

export async function GET() {
  const manifest = await getPlanningPackManifest();

  return Response.json(manifest, {
    headers: {
      'cache-control': 'no-store',
    },
  });
}
