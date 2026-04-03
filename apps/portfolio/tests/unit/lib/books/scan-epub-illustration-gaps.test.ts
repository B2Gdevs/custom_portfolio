import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import {
  isPendingIllustrationFigure,
  scanEpubIllustrationGaps,
} from '@/lib/books/scan-epub-illustration-gaps';

async function buildMinimalEpubWithPendingFigure() {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <manifest>
    <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="c1"/>
  </spine>
</package>`,
  );
  zip.file(
    'OEBPS/chapter1.xhtml',
    `<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Ch1</title></head>
<body>
  <p>Opening paragraph before any figure.</p>
  <figure id="fig-1"><img src="images/ph.png" alt="illustration pending"/><figcaption>illustration pending</figcaption></figure>
  <p>After the figure.</p>
</body>
</html>`,
  );
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('scanEpubIllustrationGaps', () => {
  it('returns pending slots with reading-order context', async () => {
    const buf = await buildMinimalEpubWithPendingFigure();
    const result = await scanEpubIllustrationGaps({ epubLabel: 'fixture', data: buf });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pendingCount).toBe(1);
    expect(result.slots[0].contextText).toContain('Opening paragraph');
    expect(result.slots[0].anchorHint).toBe('fig-1');
    expect(result.slots[0].spinePath).toContain('chapter1.xhtml');
  });

  it('rejects invalid zip', async () => {
    const result = await scanEpubIllustrationGaps({
      epubLabel: 'bad',
      data: Buffer.from([0, 1, 2, 3]),
    });
    expect(result.ok).toBe(false);
  });
});

describe('isPendingIllustrationFigure', () => {
  it('detects common placeholders', () => {
    expect(
      isPendingIllustrationFigure(
        '<figure><img alt="illustration pending" src="x"/></figure>',
      ),
    ).toBe(true);
    expect(isPendingIllustrationFigure('<figure><img alt="" src="x"/></figure>')).toBe(true);
    expect(isPendingIllustrationFigure('<figure><img alt="done" src="x"/></figure>')).toBe(false);
  });
});
