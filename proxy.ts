import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/feed", "/directory", "/companies", "/profile", "/admin"];
const AUTH_PATHS = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("__session")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/feed/:path*", "/directory/:path*", "/companies/:path*", "/profile/:path*", "/admin/:path*", "/login", "/signup"],
};
