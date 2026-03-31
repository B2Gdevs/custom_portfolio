/**
 * Vitest reporter: writes a masked snapshot of `process.env` at the end of the run.
 */
import fs from 'node:fs';
import path from 'node:path';

function sensitiveKey(key) {
  return (
    /SECRET|PASSWORD|TOKEN|PRIVATE|CREDENTIAL|BEARER/i.test(key) ||
    /API_KEY$|_KEY$/i.test(key) ||
    /^PAYLOAD_SECRET$/i.test(key) ||
    /^OPENAI_API_KEY$/i.test(key) ||
    /^ADMIN_BASIC_AUTH_PASSWORD$/i.test(key)
  );
}

export default class EnvSummaryReporter {
  static name = 'env-summary';

  onFinished() {
    const outDir = path.resolve(process.cwd(), 'test-reports', 'unit');
    fs.mkdirSync(outDir, { recursive: true });

    /** @type {Record<string, string>} */
    const variables = {};
    for (const key of Object.keys(process.env).sort()) {
      const raw = process.env[key];
      if (raw === undefined) {
        continue;
      }
      if (sensitiveKey(key)) {
        variables[key] = raw.length > 0 ? '[set — value hidden]' : '';
      } else if (raw.length > 240) {
        variables[key] = `${raw.slice(0, 237)}…`;
      } else {
        variables[key] = raw;
      }
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      variables,
    };

    fs.writeFileSync(path.join(outDir, 'environment.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }
}
