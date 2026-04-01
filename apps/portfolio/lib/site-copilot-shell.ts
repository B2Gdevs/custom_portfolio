/**
 * When to mount the Site Copilot UI shell (chat may still 503 without OPENAI_API_KEY).
 * LAN IPs cover `pnpm start` accessed as http://192.168.x.x:3000 from another device.
 */
function hostWithoutPort(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t.startsWith('[')) {
    const end = t.indexOf(']');
    if (end !== -1) return t.slice(1, end);
  }
  const lastColon = t.lastIndexOf(':');
  if (lastColon > 0 && /^\d+$/.test(t.slice(lastColon + 1))) {
    return t.slice(0, lastColon);
  }
  return t;
}

export function hostSuggestsLocalPortfolioAccess(hostHeader: string | null): boolean {
  const raw = hostHeader?.trim() ?? '';
  if (!raw) return false;
  const host = hostWithoutPort(raw);
  if (host === 'localhost' || host === '::1' || host.startsWith('127.')) return true;
  if (host.startsWith('192.168.')) return true;
  if (host.startsWith('10.')) return true;
  return /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}
