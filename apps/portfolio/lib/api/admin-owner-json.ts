import { NextResponse } from 'next/server';
import {
  adminUnauthorizedResponse,
  isAdminOwnerRequest,
} from '@/lib/auth/admin-owner-gate';

import { jsonApiError } from './http';

/**
 * Owner-admin JSON GET: gate + try/fetch + generic 500 on failure.
 * Use when the handler only returns JSON and errors are opaque to clients.
 */
export async function adminOwnerJsonGet<T>(
  request: Request,
  fetcher: () => T | Promise<T>,
  errorMessage: string,
): Promise<Response> {
  if (!(await isAdminOwnerRequest(request))) {
    return adminUnauthorizedResponse();
  }
  try {
    const data = await fetcher();
    return NextResponse.json(data);
  } catch {
    return jsonApiError(errorMessage, 500);
  }
}
