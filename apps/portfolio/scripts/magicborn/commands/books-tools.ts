import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { scanEpubIllustrationGaps } from '@/lib/books/scan-epub-illustration-gaps';
import { listSiteLogoCandidates, setActiveSiteLogo } from '@/lib/magicborn/site-logo-cli';
import { getPayloadClient } from '@/lib/payload';
import { exitJsonError, exitJsonErrorField } from '../cli-json';

export async function runBooksIllustrationsScan(rest: string[]) {
  const { values, positionals } = parseArgs({
    args: rest,
    options: {
      epub: { type: 'string' },
      json: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });
  const epubPath = (values.epub as string | undefined)?.trim();
  const slug = positionals[0]?.trim();
  const wantJson = values.json === true;
  if (!epubPath) {
    const msg =
      'Usage: magicborn books illustrations scan [label] --epub <path-to.epub> [--json]';
    exitJsonError(wantJson, msg, { error: 'missing_epub' });
  }
  const data = readFileSync(epubPath);
  const epubLabel = slug || path.basename(epubPath, path.extname(epubPath));
  const result = await scanEpubIllustrationGaps({ epubLabel, data });
  if (wantJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`Label: ${result.epubLabel}`);
    console.log(`Pending illustration slots: ${result.pendingCount}`);
    for (const s of result.slots) {
      const hint = s.anchorHint ? ` #${s.anchorHint}` : '';
      console.log(
        `- [${s.orderIndex}] ${s.spinePath} (spine ${s.spineIndex})${hint}\n  context: ${s.contextText.slice(0, 200)}${s.contextText.length > 200 ? '…' : ''}`,
      );
    }
  } else {
    console.error(result.error);
  }
  process.exit(result.ok ? 0 : 1);
}

export async function runSiteLogoList(rest: string[]) {
  const { values } = parseArgs({
    args: rest,
    options: { json: { type: 'boolean', default: false } },
  });
  const wantJson = values.json === true;
  try {
    const payload = await getPayloadClient();
    const rows = await listSiteLogoCandidates(payload);
    if (wantJson) {
      console.log(JSON.stringify({ ok: true, candidates: rows }, null, 2));
    } else {
      for (const r of rows) {
        const mark = r.isCurrent ? '*' : ' ';
        console.log(`${mark} ${r.id}\t${r.title}\t${r.sourcePath}`);
      }
    }
    process.exit(0);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    exitJsonErrorField(wantJson, message);
  }
}

export async function runSiteLogoSetActive(rest: string[]) {
  const { values, positionals } = parseArgs({
    args: rest,
    options: { json: { type: 'boolean', default: false } },
    allowPositionals: true,
  });
  const wantJson = values.json === true;
  const rawId = positionals[0]?.trim();
  if (!rawId) {
    const msg = 'Usage: magicborn site logo set-active <id> [--json]';
    exitJsonError(wantJson, msg, { error: 'missing_id' });
  }
  try {
    const payload = await getPayloadClient();
    const result = await setActiveSiteLogo(payload, rawId);
    if (result.ok) {
      if (wantJson) {
        console.log(JSON.stringify({ ok: true, id: rawId }, null, 2));
      } else {
        console.log(`Active site logo set to id=${rawId}`);
      }
      process.exit(0);
    }
    exitJsonError(wantJson, result.message, { error: 'set_active_failed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    exitJsonErrorField(wantJson, message);
  }
}
