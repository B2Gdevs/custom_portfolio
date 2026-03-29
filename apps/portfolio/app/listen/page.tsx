import { cookies } from 'next/headers';
import { ListenIndexClient } from '@/components/listen/ListenIndexClient';
import { buildListenPageRows } from '@/lib/listen-page-data';

export default async function ListenPage() {
  const rows = buildListenPageRows(await cookies());

  return <ListenIndexClient rows={rows} />;
}
