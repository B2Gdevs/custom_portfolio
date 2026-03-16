import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import matter from 'gray-matter';
import { marked } from 'marked';
import { mdxToHtml } from './mdxToHtml.js';

const require = createRequire(import.meta.url);
const Epub = require('epub-gen');
const EPUB_CSS = `
html,
body {
  margin: 0;
  padding: 0;
}

body {
  background: #f5ecde;
  color: #24170f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.92rem;
  line-height: 1.58;
}

.reader-page {
  box-sizing: border-box;
  min-height: 100%;
  padding: 1.35rem 1.85rem 1.1rem;
  display: flex;
  flex-direction: column;
}

.reader-page__chapter {
  margin: 0 0 0.38rem;
  color: #836142;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.reader-page__title {
  margin: 0;
  color: #1b120d;
  font-size: 2rem;
  line-height: 1.02;
}

.reader-page__figure {
  margin: 0.85rem 0 0.95rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.reader-page__figure img {
  display: block;
  width: 100%;
  max-width: 18rem;
  max-height: 15rem;
  margin: 0 auto;
  object-fit: cover;
  border-radius: 0.8rem;
  box-shadow: 0 18px 34px rgba(32, 18, 8, 0.16);
}

.reader-page__body {
  flex: 1 1 auto;
}

.reader-page__body > :first-child {
  margin-top: 0;
}

.reader-page__body p {
  margin: 0 0 0.78rem;
  orphans: 3;
  widows: 3;
}

.reader-page__body img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1rem auto;
  border-radius: 0.8rem;
}

.reader-page__footer {
  margin-top: auto;
  padding-top: 0.7rem;
  border-top: 1px solid rgba(94, 67, 41, 0.16);
  text-align: center;
}

.reader-page__folio {
  color: #836142;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
}

.h1,
nav h1,
h1.h1 {
  margin: 0 0 1.2rem;
  color: #1d120d;
  font-size: 2.1rem;
  line-height: 1.08;
}

nav {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 236, 221, 0.95));
  border: 1px solid rgba(102, 69, 36, 0.18);
  border-radius: 1.4rem;
  box-shadow: 0 18px 40px rgba(43, 27, 16, 0.08);
  padding: 1.8rem 2rem;
}

nav ol {
  margin: 1.1rem 0 0;
  padding: 0 0 0 1.35rem;
}

nav li {
  border-bottom: 1px solid rgba(102, 69, 36, 0.12);
  margin: 0;
  padding: 0.5rem 0;
}

nav li:last-child {
  border-bottom: none;
}

nav a,
nav a:visited {
  color: #2a1710;
  font-size: 0.98rem;
  font-weight: 600;
  text-decoration: none;
}
`;

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

function rewriteImagesToFileUrls(html: string, folder: string): string {
  const imagesDir = path.join(folder, 'images');
  if (!fs.existsSync(imagesDir)) return html;
  return html.replace(
    /(<img[^>]*\ssrc=["'])(\/books\/[^/]+\/images\/)([^"')]+)(["'][^>]*>)/g,
    (_, before, _prefix, imageName, after) => {
      const localPath = path.join(imagesDir, (imageName as string).trim());
      if (!fs.existsSync(localPath)) return '';
      return `${before}${localPath}${after}`;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractLeadImage(html: string): { leadFigure: string; bodyHtml: string } {
  const match = html.match(/^\s*<p>\s*(<img[^>]+>)\s*<\/p>/i);
  if (!match) {
    return { leadFigure: '', bodyHtml: html.trim() };
  }

  return {
    leadFigure: `<figure class="reader-page__figure">${match[1]}</figure>`,
    bodyHtml: html.replace(match[0], '').trim(),
  };
}

function extractPageNumber(fullPath: string, title: string, fallbackIndex: number): string {
  const basename = path.basename(fullPath);
  const fileMatch = basename.match(/page[-_ ]?(\d+)/i);
  if (fileMatch) return fileMatch[1];

  const titleMatch = title.match(/page\s+(\d+)/i);
  if (titleMatch) return titleMatch[1];

  return String(fallbackIndex + 1);
}

function extractChapterLabel(folder: string, fullPath: string): string {
  const chaptersRoot = path.join(folder, 'chapters');
  const relativeDir = path.relative(chaptersRoot, path.dirname(fullPath));
  const segment = relativeDir.split(path.sep)[0] || '';
  const clean = segment.replace(/^\d+[-_]?/, '');
  return clean ? slugToTitle(clean) : '';
}

function wrapPageHtml({
  title,
  bodyHtml,
  leadFigure,
  pageNumber,
  chapterLabel,
}: {
  title: string;
  bodyHtml: string;
  leadFigure: string;
  pageNumber: string;
  chapterLabel: string;
}): string {
  const chapterMeta = chapterLabel
    ? `<p class="reader-page__chapter">${escapeHtml(chapterLabel)}</p>`
    : '';

  return `
    <article class="reader-page" data-page-number="${escapeHtml(pageNumber)}">
      <header class="reader-page__header">
        ${chapterMeta}
        <h1 class="reader-page__title">${escapeHtml(title)}</h1>
      </header>
      ${leadFigure}
      <div class="reader-page__body">
        ${bodyHtml}
      </div>
      <footer class="reader-page__footer">
        <span class="reader-page__folio">${escapeHtml(pageNumber)}</span>
      </footer>
    </article>
  `.trim();
}

export async function runEpub(folder: string, outputPath: string): Promise<void> {
  const meta = loadMeta(folder);
  const files = collectMdFiles(folder);
  if (files.length === 0) {
    throw new Error(`No .md or .mdx files found in ${folder}`);
  }

  const chapters: { title: string; data: string }[] = [];
  for (const [index, fullPath] of files.entries()) {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const ext = path.extname(fullPath).toLowerCase();
    const html =
      ext === '.mdx'
        ? await mdxToHtml(content, fullPath)
        : await marked.parse(content);
    const htmlRewritten = rewriteImagesToFileUrls(html, folder);
    const title = data.title || extractTitle(content) || path.basename(fullPath, ext);
    const dataHtml = stripDuplicateTitle(htmlRewritten, title);
    const { leadFigure, bodyHtml } = extractLeadImage(dataHtml);
    const pageNumber = extractPageNumber(fullPath, title, index);
    const chapterLabel = extractChapterLabel(folder, fullPath);

    chapters.push({
      title,
      data: wrapPageHtml({
        title,
        bodyHtml,
        leadFigure,
        pageNumber,
        chapterLabel,
      }),
    });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const option = {
    title: meta.title,
    author: meta.author,
    tocTitle: 'Contents',
    appendChapterTitles: false,
    css: EPUB_CSS,
    content: chapters,
  };
  await new Epub(option, outputPath).promise;
  console.log('EPUB:', outputPath);
}
