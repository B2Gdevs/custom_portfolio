import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import archiver from 'archiver';
import { mdxToHtml } from './mdxToHtml.js';

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

function extractTitle(content: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : '';
}

export async function runPack(folder: string, outputPath: string): Promise<void> {
  const meta = loadMeta(folder);
  const files = collectMdFiles(folder);
  if (files.length === 0) {
    throw new Error(`No .md or .mdx files found in ${folder}`);
  }

  const navItems: { id: string; title: string }[] = [];
  let fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${meta.title}</title><style>body{font-family:system-ui;max-width:42rem;margin:0 auto;padding:2rem;line-height:1.6;} img{max-width:100%;}</style></head><body><h1>${meta.title}</h1><nav><ul>`;

  for (let i = 0; i < files.length; i++) {
    const raw = fs.readFileSync(files[i], 'utf8');
    const { content } = matter(raw);
    const title = extractTitle(content) || path.basename(files[i], path.extname(files[i]));
    const id = `ch-${i}`;
    navItems.push({ id, title });
    fullHtml += `<li><a href="#${id}">${title}</a></li>`;
  }
  fullHtml += '</ul></nav>';

  for (let i = 0; i < files.length; i++) {
    const raw = fs.readFileSync(files[i], 'utf8');
    const { content } = matter(raw);
    const ext = path.extname(files[i]).toLowerCase();
    const html =
      ext === '.mdx'
        ? await mdxToHtml(content, files[i])
        : await marked.parse(content);
    fullHtml += `<section id="${navItems[i].id}">${html}</section>`;
  }
  fullHtml += '</body></html>';
  fullHtml = fullHtml.replace(/\/books\/[^/]+\/images\//g, '../assets/images/');

  const imagesDir = path.join(folder, 'images');
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  await new Promise<void>((resolve, reject) => {
    output.on('close', () => resolve());
    archive.on('error', reject);
    archive.pipe(output);

    const manifest = {
      formatVersion: 1,
      title: meta.title,
      author: meta.author,
      entry: 'content/index.html',
      dependencies: {},
      buildInfo: {
        builderVersion: '1.0.0',
        buildTime: new Date().toISOString(),
      },
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'repub.json' });
    archive.append(fullHtml, { name: 'content/index.html' });
    if (fs.existsSync(imagesDir)) {
      const imgs = fs.readdirSync(imagesDir, { withFileTypes: true });
      for (const e of imgs) {
        if (e.isFile()) {
          archive.file(path.join(imagesDir, e.name), { name: `assets/images/${e.name}` });
        }
      }
    }
    archive.finalize();
  });

  console.log('Repub:', outputPath);
}
