import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'ink';
import { findRepoRoot } from '../repo-root.js';
import { execMagicbornCliArgv, resolveMagicbornCliJs } from './exec-repl-argv.js';
import { MagicbornHome } from './MagicbornHome.js';

function readCliVersion(fromImportMetaUrl: string): string {
  try {
    const dir = path.dirname(fileURLToPath(fromImportMetaUrl));
    const pkgPath = path.join(dir, '..', '..', 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const j = JSON.parse(raw) as { version?: string };
    return typeof j.version === 'string' ? j.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Interactive home: vertical catalog + REPL that re-invokes `cli.js` (capture), or full TTY for `chat`.
 */
export async function runMagicbornHomeTui(): Promise<void> {
  const root = findRepoRoot();
  const version = readCliVersion(import.meta.url);
  const cliJs = resolveMagicbornCliJs(import.meta.url);

  for (;;) {
    let endReason: 'quit' | 'chat' = 'quit';

    const branding = {
      product: process.env.MAGICBORN_BRAND_PRODUCT?.trim() || undefined,
      tagline: process.env.MAGICBORN_BRAND_TAGLINE?.trim() || undefined,
      footnote: process.env.MAGICBORN_BRAND_FOOTNOTE?.trim() || undefined,
    };

    const ink = render(
      <MagicbornHome
        repoRoot={root}
        cliVersion={version}
        cliJs={cliJs}
        branding={Object.values(branding).some(Boolean) ? branding : undefined}
        onSessionEnd={(r) => {
          endReason = r;
        }}
      />,
    );

    const onSigint = () => {
      endReason = 'quit';
      ink.unmount();
    };
    process.once('SIGINT', onSigint);

    await ink.waitUntilExit();

    process.off('SIGINT', onSigint);

    if (endReason === 'quit') {
      return;
    }

    execMagicbornCliArgv(cliJs, root, ['chat']);
  }
}
