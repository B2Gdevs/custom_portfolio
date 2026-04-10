import { NextResponse } from 'next/server';
import {
  AUTH_SESSION_MAX_AGE_SECONDS,
  getAuthTokenCookieName,
} from './config';

export function applyAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(getAuthTokenCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(getAuthTokenCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
