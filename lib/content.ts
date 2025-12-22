import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface ContentMeta {
  title: string;
  slug: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  [key: string]: any;
}

export function getContentFiles(type: 'docs' | 'projects' | 'blog'): string[] {
  const typeDir = path.join(contentDirectory, type);
  if (!fs.existsSync(typeDir)) {
    return [];
  }
  
  // Recursively get all MDX files
  const files: string[] = [];
  function walkDir(dir: string, baseDir: string = typeDir): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, baseDir);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const relativePath = path.relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  }
  
  walkDir(typeDir);
  return files;
}

export function getContentBySlug(
  type: 'docs' | 'projects' | 'blog',
  slug: string
): { meta: ContentMeta; content: string } | null {
  const typeDir = path.join(contentDirectory, type);
  const files = getContentFiles(type);
  
  // Find file matching slug (handle nested paths)
  const file = files.find((f) => {
    const fileSlug = f.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
    return fileSlug === slug;
  });

  if (!file) return null;

  // Build full file path (handle nested directories)
  const filePath = path.join(typeDir, file);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Get file stats for modification date
  const stats = fs.statSync(filePath);
  const fileModifiedDate = stats.mtime.toISOString().split('T')[0];

  return {
    meta: {
      ...data,
      slug: slug,
      // Use file modification date if no date in frontmatter
      date: data.date || fileModifiedDate,
      // Use file modification date if no updated in frontmatter
      updated: data.updated || fileModifiedDate,
    } as ContentMeta,
    content,
  };
}

/**
 * Safely parse a date string and return timestamp, or 0 if invalid
 */
function getDateTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  const timestamp = new Date(dateString).getTime();
  // If date is invalid, getTime() returns NaN
  return isNaN(timestamp) ? 0 : timestamp;
}

export function getAllContent(type: 'docs' | 'projects' | 'blog'): Array<{
  meta: ContentMeta;
  slug: string;
}> {
  const files = getContentFiles(type);
  
  return files
    .map((file) => {
      // Convert file path to slug (handle nested paths)
      const slug = file.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      const content = getContentBySlug(type, slug);
      if (!content) return null;
      return {
        meta: content.meta,
        slug,
      };
    })
    .filter((item): item is { meta: ContentMeta; slug: string } => item !== null)
    .sort((a, b) => {
      // Sort by updated date if available, otherwise by date
      // Prefer updated over date, and ensure we handle invalid dates
      const dateA = a.meta.updated 
        ? getDateTimestamp(a.meta.updated)
        : getDateTimestamp(a.meta.date);
      const dateB = b.meta.updated 
        ? getDateTimestamp(b.meta.updated)
        : getDateTimestamp(b.meta.date);
      
      // Sort descending (newest first)
      // If dates are equal or both 0, maintain stable sort order
      return dateB - dateA;
    });
}

