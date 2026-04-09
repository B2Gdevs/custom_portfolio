import { getSiteApps } from '@/lib/site-apps';
import { AppsHubPage } from '@/components/apps/AppsHubPage';

export default async function AppsPage() {
  const { apps, loadError } = await getSiteApps();
  return <AppsHubPage apps={apps} loadError={loadError} />;
}
