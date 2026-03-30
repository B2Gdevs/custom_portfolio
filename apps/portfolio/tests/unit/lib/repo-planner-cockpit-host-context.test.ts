import { describe, expect, it } from 'vitest';
import { cockpitHostContextFromPayload } from '@/lib/repo-planner/cockpit-host-context';
import {
  magicbornRunePathRepoPlannerModalPayload,
  mordredsLegacyRepoPlannerModalPayload,
  mordredsTaleRepoPlannerModalPayload,
} from '@/lib/repo-planner/reader-book-modal-payloads';

describe('cockpitHostContextFromPayload', () => {
  it('parses the neutral reader payload factories into host context', () => {
    const contexts = [
      cockpitHostContextFromPayload(mordredsTaleRepoPlannerModalPayload()),
      cockpitHostContextFromPayload(mordredsLegacyRepoPlannerModalPayload()),
      cockpitHostContextFromPayload(magicbornRunePathRepoPlannerModalPayload()),
    ];

    expect(contexts).toEqual([
      {
        readingTargetId: 'mordreds_tale',
        surfaceLabel: "Mordred's Tale",
        quickLinks: undefined,
      },
      {
        readingTargetId: 'mordreds_legacy',
        surfaceLabel: "Mordred's Legacy",
        quickLinks: undefined,
      },
      {
        readingTargetId: 'magicborn_rune_path',
        surfaceLabel: 'Magicborn: The Rune Path',
        quickLinks: undefined,
      },
    ]);
  });

  it('still accepts the legacy host payload keys for the global modal path', () => {
    expect(
      cockpitHostContextFromPayload({
        bookSlug: 'legacy-book',
        bookTitle: 'Legacy Book',
        planningLinks: [{ href: '/docs/books/planning/legacy', label: 'Planning' }],
      }),
    ).toEqual({
      readingTargetId: 'legacy-book',
      surfaceLabel: 'Legacy Book',
      quickLinks: [{ href: '/docs/books/planning/legacy', label: 'Planning' }],
    });
  });
});
