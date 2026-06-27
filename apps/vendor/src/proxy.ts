import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/routes';

/**
 * Auth guard — Next.js 16 Proxy (formerly Middleware).
 *
 * Anything that is not explicitly public requires a session. Unauthenticated
 * visitors are redirected to the sign-in page (preserving where they were
 * headed), and already-authenticated visitors are bounced away from the
 * sign-in / sign-up screens.
 */

// Routes (and their sub-paths) reachable without a session.
const PUBLIC_PREFIXES = [
  '/auth', // sign-in, sign-up, forgot/reset password, verification, etc.
  '/verify', // email verification links: /verify/[userid]
];

const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);

  // Signed-in users have no business on the sign-in / sign-up screens.
  if (token && (pathname === AUTH_ROUTES.signIn || pathname === AUTH_ROUTES.signup)) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.dashboard;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Signed-out users may only reach public routes.
  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.signIn;
    // Remember the intended destination so we can return after login.
    url.search = `?redirect=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static files (anything with a file extension).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
