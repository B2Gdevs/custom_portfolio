import { describe, expect, it } from 'vitest';
import {
  projectSeedFingerprint,
  resumeSeedFingerprint,
  toSeedProjectRecord,
  toSeedResumeRecord,
} from '@/lib/payload/public-record-seed-sync';
import {
  normalizeSiteDownloadPublishComparable,
  shouldUpdatePublishedSiteDownload,
} from '@/lib/payload/site-download-publish';

describe('public record seed sync helpers', () => {
  it('treats reordered project asset ids as the same fingerprint', () => {
    const base = toSeedProjectRecord(
      {
        slug: 'dialogue-forge',
        meta: {
          title: 'Dialogue Forge',
          description: 'Interactive narrative tooling.',
          date: '2024-12-18',
          updated: '2024-12-19',
          featured: true,
          featuredOrder: 1,
          tags: ['tools', 'story'],
          appLinks: [{ label: 'Open', href: '/apps/dialogue-forge' }],
          links: [{ label: 'GitHub', href: 'https://github.com/example/dialogue-forge' }],
          searchKeywords: ['branching dialogue'],
          media: [{ type: 'image', src: '/hero.png' }],
        },
      },
      ['9', '4'],
    );

    const reordered = toSeedProjectRecord(
      {
        slug: 'dialogue-forge',
        meta: {
          title: 'Dialogue Forge',
          description: 'Interactive narrative tooling.',
          date: '2024-12-18',
          updated: '2024-12-19',
          featured: true,
          featuredOrder: 1,
          tags: ['tools', 'story'],
          appLinks: [{ label: 'Open', href: '/apps/dialogue-forge' }],
          links: [{ label: 'GitHub', href: 'https://github.com/example/dialogue-forge' }],
          searchKeywords: ['branching dialogue'],
          media: [{ type: 'image', src: '/hero.png' }],
        },
      },
      ['4', '9'],
    );

    expect(projectSeedFingerprint(base)).toBe(projectSeedFingerprint(reordered));
  });

  it('changes the resume fingerprint when metadata changes', () => {
    const first = toSeedResumeRecord({
      slug: 'axiom',
      fileName: 'axiom_resume.html',
      title: 'Axiom Resume',
      role: 'Full-stack systems',
      summary: 'Systems-focused resume.',
      featuredOrder: 2,
    });

    const second = toSeedResumeRecord({
      slug: 'axiom',
      fileName: 'axiom_resume.html',
      title: 'Axiom Resume',
      role: 'Full-stack systems',
      summary: 'Updated systems-focused resume.',
      featuredOrder: 2,
    });

    expect(resumeSeedFingerprint(first)).not.toBe(resumeSeedFingerprint(second));
  });

  it('skips download updates when checksum and metadata are unchanged', () => {
    const desired = normalizeSiteDownloadPublishComparable({
      title: 'Planning pack bundle',
      downloadSlug: 'app--planning-pack--site-bundle',
      downloadKind: 'app-bundle',
      contentScope: 'app',
      contentSlug: 'planning-pack',
      downloadLabel: 'Download site planning pack bundle',
      summary: 'ZIP bundle.',
      checksumSha256: 'abc123',
      fileSizeBytes: 2048,
      sourcePath: '/planning-pack/site',
      isCurrent: true,
    });

    expect(desired).not.toBeNull();
    expect(
      shouldUpdatePublishedSiteDownload(
        {
          title: 'Planning pack bundle',
          downloadSlug: 'app--planning-pack--site-bundle',
          downloadKind: 'app-bundle',
          contentScope: 'app',
          contentSlug: 'planning-pack',
          downloadLabel: 'Download site planning pack bundle',
          summary: 'ZIP bundle.',
          checksumSha256: 'abc123',
          fileSizeBytes: 2048,
          sourcePath: '/planning-pack/site',
          isCurrent: true,
        },
        desired!,
      ),
    ).toBe(false);
  });
});
