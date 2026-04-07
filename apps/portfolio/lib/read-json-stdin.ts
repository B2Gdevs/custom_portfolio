/**
 * Read JSON from `process.stdin` (tsx worker scripts invoked with piped JSON).
 * When stdin is empty and `ifEmpty` is set, returns that value (avoids `JSON.parse('')`).
 */
export async function readJsonFromStdin<T>(ifEmpty?: T): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const buf = Buffer.concat(chunks);
  if (!buf.length && ifEmpty !== undefined) {
    return ifEmpty;
  }
  return JSON.parse(buf.toString('utf8')) as T;
}
