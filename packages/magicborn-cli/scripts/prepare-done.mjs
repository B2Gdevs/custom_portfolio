import fs from 'node:fs';
import { installHookLog } from '../../../scripts/run-install-hook-log.mjs';

installHookLog('[@magicborn/cli] prepare: tsc finished');
fs.writeSync(2, '[@magicborn/cli] prepare: tsc finished.\n');
