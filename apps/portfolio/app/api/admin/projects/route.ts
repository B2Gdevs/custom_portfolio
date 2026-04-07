import { adminOwnerJsonGet } from '@/lib/api/admin-owner-json';
import { getProjectSummaries } from '@/lib/projects';

export async function GET(request: Request) {
  return adminOwnerJsonGet(request, () => getProjectSummaries(), 'Failed to fetch projects');
}
