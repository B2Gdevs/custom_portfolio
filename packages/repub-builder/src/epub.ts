import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import matter from 'gray-matter';
import { marked } from 'marked';
import { mdxToHtml } from './mdxToHtml.js';

const require = createRequire(import.meta.url);
const Epub = require('epub-gen');

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function loadMeta(folder: string): { title: string; author: string } {
  const p = path.join(folder, 'book.json');
  if (!fs.existsSync(p)) {
    return { title: slugToTitle(path.basename(folder)), author: '' };
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    title: data.title || slugToTitle(path.basename(folder)),
    author: data.author || '',
  };
}

function collectMdFiles(folder: string): string[] {
  const entries: string[] = [];
  const chaptersDir = path.join(folder, 'chapters');
  if (fs.existsSync(chaptersDir)) {
    const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    for (const chDir of chapterDirs) {
      const chPath = path.join(chaptersDir, chDir);
      const files = fs.readdirSync(chPath, { withFileTypes: true })
        .filter((e) => e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx')))
        .map((e) => path.join(chPath, e.name))
        .sort();
      entries.push(...files);
    }
  } else {
    const files = fs.readdirSync(folder, { withFileTypes: true })
      .filter((e) => e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx')))
      .map((e) => path.join(folder, e.name))
      .sort();
    entries.push(...files);
  }
  return entries;
}

function rewriteImagesToBase64(html: string, folder: string): string {
  const imagesDir = path.join(folder, 'images');
  if (!fs.existsSync(imagesDir)) return html;
  return html.replace(
    /(<img[^>]*\ssrc=["'])(\/books\/[^/]+\/images\/)([^"')]+)(["'][^>]*>)/g,
    (_, before, _prefix, imageName, after) => {
      const localPath = path.join(imagesDir, (imageName as string).trim());
      if (!fs.existsSync(localPath)) return before + _prefix + imageName + after;
      try {
        const buf = fs.readFileSync(localPath);
        const ext = path.extname(imageName as string).toLowerCase();
        const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
        const b64 = buf.toString('base64');
        return `${before}data:${mime};base64,${b64}${after}`;
      } catch {
        return before + _prefix + imageName + after;
      }
    }
  );
}

function extractTitle(content: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : '';
}

/** Remove the first H1 when it exactly matches the chapter title to avoid duplicate page titles. */
function stripDuplicateTitle(html: string, chapterTitle: string): string {
  const h1Match = html.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i);
  if (!h1Match) return html;
  const innerText = h1Match[1].replace(/<[^>]+>/g, '').trim();
  if (innerText !== chapterTitle) return html;
  return html.replace(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i, '').trim();
}

export async function runEpub(folder: string, outputPath: string): Promise<void> {
  const meta = loadMeta(folder);
  const files = collectMdFiles(folder);
  if (files.length === 0) {
    throw new Error(`No .md or .mdx files found in ${folder}`);
  }

  const chapters: { title: string; data: string }[] = [];
  for (const fullPath of files) {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const ext = path.extname(fullPath).toLowerCase();
    const html =
      ext === '.mdx'
        ? await mdxToHtml(content, fullPath)
        : await marked.parse(content);
    const htmlRewritten = rewriteImagesToBase64(html, folder);
    const title = data.title || extractTitle(content) || path.basename(fullPath, ext);
    const dataHtml = stripDuplicateTitle(htmlRewritten, title);
    chapters.push({ title, data: dataHtml });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const option = {
    title: meta.title,
    author: meta.author,
    content: chapters,
  };
  await new Epub(option, outputPath).promise;
  console.log('EPUB:', outputPath);
}
