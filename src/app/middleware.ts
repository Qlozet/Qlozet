import { AUTH_ROUTES } from "@/lib/routes";
import { NextRequest, NextResponse } from "next/server";

// List of public routes that don't require authentication
const publicRoutes: string[] = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.verifyAccountMessage,
  AUTH_ROUTES.resetPassword,
  AUTH_ROUTES.accountVerification,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.signup,
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("SESSION_COOKIE_KEY")?.value;
  const { pathname } = request.nextUrl;
  const isOnboarding =
    request.nextUrl.searchParams.get("onboarding") === "true";

  if (!token && isOnboarding && !publicRoutes.includes(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.delete("onboarding", "true");
    return NextResponse.redirect(redirectUrl);
  }

  if (!token && !isOnboarding && !publicRoutes.includes(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to protected routes if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
