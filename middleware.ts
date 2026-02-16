import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/mcp"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // MCP endpoint uses bearer token auth (handled in route)
  if (pathname.startsWith("/api/mcp")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("cc-auth");
  if (authCookie?.value === process.env.AUTH_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to login
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
