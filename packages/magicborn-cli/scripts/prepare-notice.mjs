import fs from 'node:fs';
import { installHookLog } from '../../../scripts/run-install-hook-log.mjs';

installHookLog('[@magicborn/cli] prepare: start (before tsc)');
fs.writeSync(
  2,
  '[@magicborn/cli] prepare: `tsc` (usually <2min; 30s heartbeats). Tail: `.tmp/pnpm-install-hooks.log`. Disable log: INSTALL_HOOK_LOG=0\n',
);
