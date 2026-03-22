import { authMiddleware } from "next-firebase-auth-edge";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/lib/firebase/auth-edge";

const PROTECTED_PATHS = ["/feed", "/directory", "/companies", "/cities", "/profile", "/admin"];
const AUTH_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  return authMiddleware(request, {
    ...authConfig,
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    handleValidToken: async (_tokens, headers) => {
      // Logged-in users shouldn't see auth pages
      if (AUTH_PATHS.some((p) => pathname === p)) {
        return NextResponse.redirect(new URL("/feed", request.url));
      }
      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (_reason) => {
      // Redirect to login for protected paths
      if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    },
    handleError: async (_error) => {
      if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/directory/:path*",
    "/companies/:path*",
    "/cities/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/login/verify",
    "/api/login",
    "/api/logout",
  ],
};
