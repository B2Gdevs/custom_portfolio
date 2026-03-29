import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getBasicAuthCredentials } from './config';

function equalsSafe(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireBasicAdminAuth(request: Request): NextResponse | null {
  const credentials = getBasicAuthCredentials();
  if (!credentials) {
    return NextResponse.json(
      { error: 'basic_auth_unconfigured', message: 'Admin basic auth is not configured.' },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) {
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Portfolio Admin"' },
    });
  }

  const encoded = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  const username = separator >= 0 ? decoded.slice(0, separator) : '';
  const password = separator >= 0 ? decoded.slice(separator + 1) : '';

  const isValid =
    equalsSafe(username, credentials.username) && equalsSafe(password, credentials.password);

  if (!isValid) {
    return new NextResponse('Invalid credentials.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Portfolio Admin"' },
    });
  }

  return null;
}
