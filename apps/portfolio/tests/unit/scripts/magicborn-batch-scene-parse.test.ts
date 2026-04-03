import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { parseBatchScenes } from '@/scripts/magicborn/batch-scene-parse';

describe('parseBatchScenes', () => {
  const tmpDir = path.join(process.cwd(), '.tmp', 'batch-scene-parse-test');

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('parses comma-separated scenes', () => {
    expect(parseBatchScenes('a, b', undefined, '/tmp')).toEqual(['a', 'b']);
  });

  it('reads one scene per line from file', () => {
    mkdirSync(tmpDir, { recursive: true });
    const p = path.join(tmpDir, 'scenes.txt');
    writeFileSync(p, 'intro\n\nbeat two\n', 'utf8');
    expect(parseBatchScenes(undefined, p, '/tmp')).toEqual(['intro', 'beat two']);
  });

  it('returns empty when no csv or file', () => {
    expect(parseBatchScenes(undefined, undefined, '/tmp')).toEqual([]);
  });
});
