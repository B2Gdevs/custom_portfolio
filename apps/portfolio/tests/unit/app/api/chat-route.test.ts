import { POST } from '@/app/api/chat/route';
import { retrieveRagContext } from '@/lib/rag/retrieve';

vi.mock('@/lib/rag/retrieve', () => ({
  retrieveRagContext: vi.fn(),
}));

describe('/api/chat', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      LOG_LEVEL: 'silent',
      NEXT_PUBLIC_LOG_LEVEL: 'silent',
    };
    globalThis.__PORTFOLIO_LOGS__ = [];
    vi.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 503 when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Who is Morgana?' }],
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'site_chat_unconfigured',
    });
  });

  it('returns 400 when no user query is present', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'missing_query',
    });
  });

  it('retrieves RAG context and forwards the grounded conversation to OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';

    vi.mocked(retrieveRagContext).mockResolvedValue([
      {
        chunkId: 1,
        sourceId: 'docs:magicborn/morgana-the-sleeping-root',
        sourceKind: 'magicborn',
        sourceScope: 'magicborn',
        title: 'Morgana, the Sleeping Root',
        heading: 'Known Facts',
        anchor: 'known-facts',
        publicUrl: '/docs/magicborn/morgana-the-sleeping-root',
        sourcePath: 'apps/portfolio/content/docs/magicborn/morgana-the-sleeping-root.mdx',
        content: 'Morgana powers relics.',
        snippet: 'Morgana powers relics.',
        distance: 0.2,
        score: 0.9,
      },
    ]);

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: 'Morgana is the sleeping source powering relics in Magicborn.',
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Who is Morgana?' },
            { role: 'assistant', content: 'She is central to the lore.' },
            { role: 'user', content: 'Can you say more?' },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-portfolio-request-id')).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      text: 'Morgana is the sleeping source powering relics in Magicborn.',
      query: 'Can you say more?',
      model: 'gpt-4o-mini',
      hits: [
        expect.objectContaining({
          sourceId: 'docs:magicborn/morgana-the-sleeping-root',
        }),
      ],
    });

    expect(retrieveRagContext).toHaveBeenCalledWith('Can you say more?');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-openai-key',
        }),
      }),
    );

    const openAiRequest = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body ?? '{}'));
    expect(openAiRequest.model).toBe('gpt-4o-mini');
    expect(openAiRequest.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('Ben Garrard'),
        }),
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('Morgana, the Sleeping Root'),
        }),
        expect.objectContaining({
          role: 'assistant',
          content: 'She is central to the lore.',
        }),
        expect.objectContaining({
          role: 'user',
          content: 'Can you say more?',
        }),
      ]),
    );
  });

  it('returns 502 when the upstream chat request throws before a response is returned', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    vi.mocked(retrieveRagContext).mockResolvedValue([]);
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('socket hang up'));

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Who is Ben?' }],
        }),
      }),
    );

    expect(response.status).toBe(502);
    expect(response.headers.get('x-portfolio-request-id')).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      error: 'upstream_chat_failed',
      message: 'The upstream chat provider could not be reached.',
    });
  });
});
