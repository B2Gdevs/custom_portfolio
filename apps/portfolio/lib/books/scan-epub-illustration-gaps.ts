import JSZip from 'jszip';

export type IllustrationSlot = {
  spineIndex: number;
  spinePath: string;
  orderIndex: number;
  anchorHint?: string;
  contextText: string;
  matchSnippet: string;
};

export type ScanEpubIllustrationGapsResult =
  | {
      ok: true;
      epubLabel: string;
      pendingCount: number;
      slots: IllustrationSlot[];
    }
  | { ok: false; error: string };

function dirnameZip(p: string): string {
  const i = p.lastIndexOf('/');
  return i <= 0 ? '' : p.slice(0, i);
}

function joinZip(base: string, href: string): string {
  const h = href.replace(/^\//, '');
  if (!base) return h;
  if (h.startsWith('../')) {
    const parts = base.split('/').filter(Boolean);
    let rest = h;
    while (rest.startsWith('../')) {
      parts.pop();
      rest = rest.slice(3);
    }
    return [...parts, rest].join('/');
  }
  return `${base}/${h}`;
}

function parseContainerRootfile(containerXml: string): string | null {
  const m = containerXml.match(/full-path\s*=\s*["']([^"']+)["']/i);
  return m?.[1]?.trim() ?? null;
}

function parseOpfManifestAndSpine(opf: string): {
  manifest: Map<string, string>;
  spineIds: string[];
} {
  const manifest = new Map<string, string>();
  const manifestBlock = opf.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
  const inner = manifestBlock?.[1] ?? opf;
  const itemRe = /<item\b([^>]*)\/?>/gi;
  let im: RegExpExecArray | null;
  while ((im = itemRe.exec(inner))) {
    const attrs = im[1];
    const idM = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const hrefM = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (idM?.[1] && hrefM?.[1]) {
      manifest.set(idM[1], hrefM[1]);
    }
  }

  const spineBlock = opf.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  const spineInner = spineBlock?.[1] ?? '';
  const spineIds: string[] = [];
  const refRe = /<itemref\b[^>]*\bidref\s*=\s*["']([^"']+)["'][^>]*\/?>/gi;
  let ir: RegExpExecArray | null;
  while ((ir = refRe.exec(spineInner))) {
    spineIds.push(ir[1]);
  }

  return { manifest, spineIds };
}

function extractBodyInner(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

function stripTagsToText(html: string): string {
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const text = noScript.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

function splitByFigures(html: string): Array<{ type: 'text' | 'figure'; content: string }> {
  const out: Array<{ type: 'text' | 'figure'; content: string }> = [];
  let i = 0;
  const s = html;
  while (i < s.length) {
    const figStart = s.toLowerCase().indexOf('<figure', i);
    if (figStart === -1) {
      out.push({ type: 'text', content: s.slice(i) });
      break;
    }
    if (figStart > i) {
      out.push({ type: 'text', content: s.slice(i, figStart) });
    }
    const closeIdx = s.toLowerCase().indexOf('</figure>', figStart);
    if (closeIdx === -1) {
      out.push({ type: 'text', content: s.slice(figStart) });
      break;
    }
    const fullEnd = closeIdx + '</figure>'.length;
    out.push({ type: 'figure', content: s.slice(figStart, fullEnd) });
    i = fullEnd;
  }
  return out;
}

export function isPendingIllustrationFigure(html: string): boolean {
  const lower = html.toLowerCase();
  if (lower.includes('illustration pending')) return true;
  if (lower.includes('placeholder') && lower.includes('<img')) return true;
  if (/alt\s*=\s*["'][^"']*pending[^"']*["']/i.test(html)) return true;
  if (/alt\s*=\s*["'][^"']*tbd[^"']*["']/i.test(html)) return true;
  if (/alt\s*=\s*["']\s*["']/i.test(html) && lower.includes('<img')) return true;
  return false;
}

function figureAnchorHint(html: string): string | undefined {
  const m = html.match(/<figure[^>]*\bid\s*=\s*["']([^"']+)["']/i);
  if (m?.[1]) return m[1];
  const im = html.match(/<img[^>]*\bid\s*=\s*["']([^"']+)["']/i);
  return im?.[1];
}

function snippet(html: string, max = 160): string {
  const t = stripTagsToText(html);
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

/**
 * Walk spine XHTML in order; detect placeholder figures; attach reading-order context
 * (prose from chapter open or previous figure through text immediately before the slot).
 */
export async function scanEpubIllustrationGaps(params: {
  epubLabel: string;
  data: Uint8Array | ArrayBuffer | Buffer;
}): Promise<ScanEpubIllustrationGapsResult> {
  const { epubLabel } = params;
  const buf = Buffer.isBuffer(params.data)
    ? params.data
    : Buffer.from(
        params.data instanceof ArrayBuffer ? new Uint8Array(params.data) : new Uint8Array(params.data),
      );

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buf);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'failed_to_load_zip',
    };
  }

  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) {
    return { ok: false, error: 'missing_META-INF_container_xml' };
  }
  const containerXml = await containerFile.async('string');
  const opfRel = parseContainerRootfile(containerXml);
  if (!opfRel) {
    return { ok: false, error: 'container_rootfile_not_found' };
  }

  const opfNorm = opfRel.replace(/\\/g, '/');
  const opfFile = zip.file(opfNorm);
  if (!opfFile) {
    return { ok: false, error: `opf_not_found:${opfNorm}` };
  }
  const opfXml = await opfFile.async('string');
  const { manifest, spineIds } = parseOpfManifestAndSpine(opfXml);
  const opfDir = dirnameZip(opfNorm);

  const slots: IllustrationSlot[] = [];
  let orderIndex = 0;

  for (let spineIndex = 0; spineIndex < spineIds.length; spineIndex++) {
    const id = spineIds[spineIndex];
    const href = manifest.get(id);
    if (!href) continue;
    const spinePath = joinZip(opfDir, href).replace(/\\/g, '/');
    const chapterFile = zip.file(spinePath);
    if (!chapterFile) continue;
    const raw = await chapterFile.async('string');
    if (!/\.(x?html?|xml)$/i.test(spinePath) && !raw.includes('<')) {
      continue;
    }
    const body = extractBodyInner(raw);
    const segments = splitByFigures(body);
    let textSinceBoundary = '';

    for (const seg of segments) {
      if (seg.type === 'text') {
        const t = stripTagsToText(seg.content);
        if (t) {
          textSinceBoundary = textSinceBoundary ? `${textSinceBoundary} ${t}` : t;
        }
        continue;
      }
      const fig = seg.content;
      if (!isPendingIllustrationFigure(fig)) {
        textSinceBoundary = '';
        continue;
      }
      const contextText = textSinceBoundary;
      slots.push({
        spineIndex,
        spinePath,
        orderIndex,
        anchorHint: figureAnchorHint(fig),
        contextText,
        matchSnippet: snippet(fig),
      });
      orderIndex += 1;
      textSinceBoundary = '';
    }
  }

  return {
    ok: true,
    epubLabel,
    pendingCount: slots.length,
    slots,
  };
}
