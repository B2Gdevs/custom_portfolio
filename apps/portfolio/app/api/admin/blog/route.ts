import { getAllContent } from '@/lib/content';
import { adminOwnerJsonGet } from '@/lib/api/admin-owner-json';

export async function GET(request: Request) {
  return adminOwnerJsonGet(request, () => getAllContent('blog'), 'Failed to fetch blog posts');
}
