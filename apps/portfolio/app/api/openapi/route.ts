import { NextResponse } from 'next/server';
import { publicPortfolioOpenApi } from '@/lib/openapi/public-portfolio-openapi';

export const runtime = 'nodejs';

/**
 * Serves the public OpenAPI document for Swagger UI (`/docs/api`) and external tools.
 */
export async function GET() {
  return NextResponse.json(publicPortfolioOpenApi, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
