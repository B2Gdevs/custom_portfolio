import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import {
  extractH2Sections,
  extractSceneCandidatesFromMdx,
  isSceneLikeHeading,
} from '@/lib/magicborn/extract-mdx-scenes';

const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/magicborn-scene-extract/sample-scenes.mdx',
);

describe('extract-mdx-scenes', () => {
  it('isSceneLikeHeading matches expected phrases', () => {
    expect(isSceneLikeHeading('Scene — the bridge')).toBe(true);
    expect(isSceneLikeHeading('Chapter four — x')).toBe(true);
    expect(isSceneLikeHeading('Letter from the coast')).toBe(true);
    expect(isSceneLikeHeading('Random musings')).toBe(false);
  });

  it('extractH2Sections splits on ## and keeps body until next ##', () => {
    const raw = readFileSync(fixturePath, 'utf8');
    const { content } = matter(raw);
    const sections = extractH2Sections(content);
    expect(sections.length).toBe(4);
    expect(sections[0].heading).toContain('Opening');
    expect(sections[0].body).toContain('Fog on the canal');
    expect(sections[1].heading).toContain('Scene');
    expect(sections[1].body).toContain('sealed letter');
  });

  it('extractSceneCandidatesFromMdx filters to scene-like headings by default', () => {
    const raw = readFileSync(fixturePath, 'utf8');
    const { content } = matter(raw);
    const scenes = extractSceneCandidatesFromMdx(content);
    const headings = scenes.map((s) => s.heading);
    expect(headings.some((h) => h.includes('Opening'))).toBe(true);
    expect(headings.some((h) => h.includes('Scene'))).toBe(true);
    expect(headings.some((h) => h.includes('Chapter'))).toBe(true);
    expect(headings.some((h) => h.includes('Notes for the editor'))).toBe(false);
  });

  it('includeAllHeadings returns every H2', () => {
    const raw = readFileSync(fixturePath, 'utf8');
    const { content } = matter(raw);
    const all = extractSceneCandidatesFromMdx(content, { includeAllHeadings: true });
    expect(all.length).toBe(4);
  });
});
