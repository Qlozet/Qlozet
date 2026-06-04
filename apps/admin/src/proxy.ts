import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_ROUTES } from '@/lib/routes';
import { PAGES_IN_PROGRESS } from '@/lib/feature-flags';

/**
 * Temporary auth guard — Next.js 16 Proxy (formerly Middleware), gated behind
 * the PAGES_IN_PROGRESS feature flag.
 *
 * While the in-app pages are still being built, the app is locked behind the
 * auth screens: any non-auth route is redirected to the sign-in page. Flip the
 * flag off (or remove this proxy) once the pending pages are ready.
 */
export function proxy(request: NextRequest) {
  // App not locked — let every route through as normal
  if (!PAGES_IN_PROGRESS) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow the auth screens through
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Everything else goes back to sign-in
  const url = request.nextUrl.clone();
  url.pathname = AUTH_ROUTES.signIn;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and static files (anything with a file extension)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
