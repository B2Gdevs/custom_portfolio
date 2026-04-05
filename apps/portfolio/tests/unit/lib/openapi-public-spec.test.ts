import { describe, expect, it } from 'vitest';
import { publicPortfolioOpenApi } from '@/lib/openapi/public-portfolio-openapi';

describe('publicPortfolioOpenApi', () => {
  it('is OpenAPI 3.x with paths for core public routes', () => {
    expect(publicPortfolioOpenApi.openapi).toMatch(/^3\./);
    expect(publicPortfolioOpenApi.paths['/api/openapi']).toBeDefined();
    expect(publicPortfolioOpenApi.paths['/api/content/search']).toBeDefined();
    expect(publicPortfolioOpenApi.paths['/api/published-book-artifacts/file/{filename}']).toBeDefined();
  });

  it('does not list admin routes', () => {
    const keys = Object.keys(publicPortfolioOpenApi.paths);
    expect(keys.some((k) => k.includes('admin'))).toBe(false);
  });
});
