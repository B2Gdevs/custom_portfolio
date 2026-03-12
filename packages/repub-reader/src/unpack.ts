import JSZip from 'jszip';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface UnpackResult {
  /** Blob URL for the entry HTML (assets rewritten to blob URLs). Call revoke() when done. */
  entryUrl: string;
  /** Revoke all blob URLs created during unpack. Call on unmount or when switching book. */
  revoke: () => void;
}

/**
 * Unpack a .repub (ZIP) buffer and return a blob URL for the entry document
 * with asset references rewritten to blob URLs. Call revoke() when done.
 */
export async function unpackRepub(buffer: ArrayBuffer): Promise<UnpackResult> {
  const zip = await JSZip.loadAsync(buffer);
  const manifestFile = zip.file('repub.json');
  const entryFile = zip.file('content/index.html');
  if (!manifestFile || !entryFile) {
    throw new Error('Invalid .repub: missing repub.json or content/index.html');
  }
  let html = await entryFile.async('string');
  const blobUrlsMap: Record<string, string> = {};
  const createdUrls: string[] = [];

  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  for (const name of names) {
    const file = zip.file(name);
    if (!file) continue;
    const blob = await file.async('blob');
    const url = URL.createObjectURL(blob);
    blobUrlsMap[name] = url;
    createdUrls.push(url);
  }

  for (const [path, url] of Object.entries(blobUrlsMap)) {
    if (path.startsWith('assets/')) {
      const basename = path.replace('assets/', '');
      const patterns = [
        new RegExp(`(["'])\\.\\./assets/${escapeRegExp(basename)}(["'])`, 'g'),
        new RegExp(`(["'])\\./assets/${escapeRegExp(basename)}(["'])`, 'g'),
        new RegExp(`(["'])/assets/${escapeRegExp(basename)}(["'])`, 'g'),
      ];
      for (const re of patterns) {
        html = html.replace(re, `$1${url}$2`);
      }
    }
  }

  const htmlBlob = new Blob([html], { type: 'text/html' });
  const entryUrl = URL.createObjectURL(htmlBlob);
  createdUrls.push(entryUrl);

  function revoke(): void {
    createdUrls.forEach(URL.revokeObjectURL);
  }

  return { entryUrl, revoke };
}
