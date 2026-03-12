'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const Epub = require('epub-gen');

const contentDir = path.join(process.cwd(), 'content', 'books');
const publicBooksDir = path.join(process.cwd(), 'public', 'books');

if (!fs.existsSync(contentDir)) {
  console.log('No content/books directory, skipping EPUB build.');
  process.exit(0);
}

const bookSlugs = fs.readdirSync(contentDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

async function buildOne(slug) {
  const bookDir = path.join(contentDir, slug);
  const files = fs.readdirSync(bookDir, { withFileTypes: true })
    .filter((e) => e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx')))
    .map((e) => e.name);

  const chapters = [];
  for (const file of files) {
    const fullPath = path.join(bookDir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const order = data.order != null ? Number(data.order) : 999;
    const html = await marked.parse(content);
    chapters.push({
      order,
      title: data.title || file.replace(/\.(md|mdx)$/, ''),
      data: html,
    });
  }
  chapters.sort((a, b) => a.order - b.order);

  const firstTitle = chapters[0]?.title || slug;
  const option = {
    title: firstTitle,
    author: 'Portfolio',
    content: chapters.map((ch) => ({ title: ch.title, data: ch.data })),
  };

  const outDir = path.join(publicBooksDir, slug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outputPath = path.join(outDir, 'book.epub');

  await new Epub(option, outputPath).promise;
  console.log('Built:', outputPath);
}

(async () => {
  for (const slug of bookSlugs) {
    await buildOne(slug);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
