import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin sub-routes (but let the root /admin login page load)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__secure-better-auth.session_token");

    if (!sessionCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
