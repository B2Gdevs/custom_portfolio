import { GET } from '@/app/api/openapi/route';

describe('/api/openapi', () => {
  it('returns public OpenAPI JSON (no admin paths)', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as { openapi?: string; paths?: Record<string, unknown> };
    expect(json.openapi).toMatch(/^3\./);
    expect(json.paths?.['/api/openapi']).toBeDefined();
    expect(json.paths?.['/api/content/search']).toBeDefined();
    const keys = Object.keys(json.paths ?? {});
    expect(keys.some((k) => k.includes('admin'))).toBe(false);
  });
});
