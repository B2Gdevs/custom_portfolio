import { createLogger, getRecentLogs } from '@/lib/logging';

describe('logging', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: 'debug',
      LOG_SCOPES: '',
      NEXT_PUBLIC_LOG_LEVEL: 'debug',
      NEXT_PUBLIC_LOG_SCOPES: '',
    };
    globalThis.__PORTFOLIO_LOGS__ = [];
    vi.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redacts sensitive keys and stores sanitized entries', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('chat.api', { runtime: 'server' });

    logger.info('request received', {
      authorization: 'Bearer secret',
      nested: {
        apiKey: 'abc123',
      },
      query: 'who is ben',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      '[portfolio][server][chat.api][info] request received',
      expect.objectContaining({
        authorization: '[redacted]',
        nested: expect.objectContaining({
          apiKey: '[redacted]',
        }),
        query: 'who is ben',
      }),
    );
    expect(getRecentLogs('server')).toEqual([
      expect.objectContaining({
        scope: 'chat.api',
        level: 'info',
        data: expect.objectContaining({
          authorization: '[redacted]',
        }),
      }),
    ]);
  });

  it('filters logs by scope prefix', () => {
    process.env.LOG_SCOPES = 'chat';

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    createLogger('rag.ingest', { runtime: 'server' }).info('ignored');
    createLogger('chat.api', { runtime: 'server' }).info('emitted');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith('[portfolio][server][chat.api][info] emitted');
  });

  it('supports client runtime config separately from server config', () => {
    process.env.LOG_LEVEL = 'silent';
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';
    process.env.NEXT_PUBLIC_LOG_SCOPES = 'chat';

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    createLogger('chat.ui', { runtime: 'client' }).debug('client event', {
      message: 'hello',
    });

    expect(debugSpy).toHaveBeenCalledWith(
      '[portfolio][client][chat.ui][debug] client event',
      expect.objectContaining({
        message: 'hello',
      }),
    );
  });
});
