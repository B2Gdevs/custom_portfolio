import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const spawnMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}));

class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn(() => true);
}

describe('site download assets worker runner', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    spawnMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('kills and rejects a hanging worker after the timeout window', async () => {
    const child = new FakeChildProcess();
    spawnMock.mockReturnValue(child);

    const { runSiteDownloadAssetsWorker } = await import('@/lib/site-download-assets-worker-runner');
    const promise = runSiteDownloadAssetsWorker({ downloadKind: 'planning-pack' });
    const expectation = expect(promise).rejects.toThrow('site download assets worker timed out');

    await vi.advanceTimersByTimeAsync(3000);

    await expectation;
    expect(child.kill).toHaveBeenCalledTimes(1);
  });
});
