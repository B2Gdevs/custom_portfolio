import { cookies } from 'next/headers';
import { ListenIndexClient } from '@/components/listen/ListenIndexClient';
import { buildListenPageRows } from '@/lib/listen-page-data';

export default async function ListenPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
  const rows = await buildListenPageRows({
    cookieStore,
    cookieHeader,
  });

  return <ListenIndexClient rows={rows} />;
}
