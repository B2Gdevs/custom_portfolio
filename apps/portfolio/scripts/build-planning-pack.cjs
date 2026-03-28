#!/usr/bin/env node
/**
 * Build-time: export planning MDX from content/docs into public/planning-pack/site/
 * (mirrored paths as .md) and merge with demo/*.md into public/planning-pack/manifest.json.
 * Repo-root .planning markdown is never included (see REQUIREMENTS).
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const CONTENT_DOCS = path.join(ROOT, 'content', 'docs');
const OUT_SITE = path.join(ROOT, 'public', 'planning-pack', 'site');
const OUT_MANIFEST = path.join(ROOT, 'public', 'planning-pack', 'manifest.json');
const DEMO_DIR = path.join(ROOT, 'public', 'planning-pack', 'demo');

const SECTION_LABELS = {
  global: 'Global',
  books: 'Books',
  'dialogue-forge': 'Dialogue Forge',
  blog: 'Blog',
  documentation: 'Documentation',
  editor: 'Editor',
  magicborn: 'Magicborn',
  'repo-planner': 'Repo Planner',
};

function formatSectionLabel(sectionKey) {
  if (SECTION_LABELS[sectionKey]) return SECTION_LABELS[sectionKey];
  return sectionKey
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isPlanningDocSlug(slug) {
  const leaf = slug.split('/').pop() || slug;
  return (
    leaf === 'planning-docs' ||
    leaf === 'global-planning' ||
    leaf === 'state' ||
    leaf === 'task-registry' ||
    leaf === 'errors-and-attempts' ||
    leaf === 'decisions'
  );
}

function walkDocs(dir, baseRel, acc) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    const rel = baseRel ? `${baseRel}/${name.name}` : name.name;
    if (name.isDirectory()) {
      walkDocs(full, rel, acc);
    } else if (name.name.endsWith('.mdx') || name.name.endsWith('.md')) {
      const slug = rel.replace(/\.(mdx|md)$/, '').replace(/\\/g, '/');
      acc.push({ full, slug });
    }
  }
  return acc;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function buildSiteEntries() {
  const files = [];
  walkDocs(CONTENT_DOCS, '', files);
  const entries = [];

  rmrf(OUT_SITE);
  ensureDir(OUT_SITE);

  for (const { full, slug } of files) {
    if (!isPlanningDocSlug(slug)) continue;
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    const sectionKey = slug.split('/')[0] || 'general';
    const outRel = `${slug}.md`.replace(/\\/g, '/');
    const outPath = path.join(OUT_SITE, outRel);
    ensureDir(path.dirname(outPath));

    const header = [
      '<!--',
      `  Exported from: content/docs/${slug}.mdx`,
      '  Generated — edit the MDX source, not this file.',
      `  title: ${data.title || slug}`,
      `  slug: ${slug}`,
      '  -->',
      '',
    ].join('\n');

    fs.writeFileSync(outPath, `${header}${content.trim()}\n`, 'utf8');

    entries.push({
      id: slug.replace(/\//g, '__'),
      title: typeof data.title === 'string' ? data.title : slug,
      file: `/planning-pack/site/${outRel}`,
      filename: `${path.posix.basename(slug)}.md`,
      section: sectionKey,
      sectionLabel: formatSectionLabel(sectionKey),
      slug,
    });
  }

  entries.sort((a, b) => {
    const sec = a.section.localeCompare(b.section);
    if (sec !== 0) return sec;
    return a.slug.localeCompare(b.slug);
  });

  return entries;
}

function buildDemoEntries() {
  if (!fs.existsSync(DEMO_DIR)) return [];
  const entries = [];
  for (const name of fs.readdirSync(DEMO_DIR)) {
    if (!name.endsWith('.md')) continue;
    const full = path.join(DEMO_DIR, name);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const base = name.replace(/\.md$/, '');
    entries.push({
      id: `demo-${base.replace(/[^a-z0-9-]/gi, '-')}`,
      title: typeof data.title === 'string' ? data.title : base.replace(/-/g, ' '),
      file: `/planning-pack/demo/${name}`,
      filename: name,
      section: 'demo',
      sectionLabel: 'Starter template',
      slug: `demo/${base}`,
    });
  }
  entries.sort((a, b) => a.title.localeCompare(b.title));
  return entries;
}

function main() {
  const site = buildSiteEntries();
  const demo = buildDemoEntries();

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    demo,
    site,
  };

  ensureDir(path.dirname(OUT_MANIFEST));
  fs.writeFileSync(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `[build-planning-pack] ${demo.length} demo + ${site.length} site entries → public/planning-pack/manifest.json`,
  );
}

main();
