import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "cc-auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function verifyAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === process.env.AUTH_PASSWORD;
}

export function verifyMcpAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.MCP_SECRET;
}

export function setAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, process.env.AUTH_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAME);
  return response;
}
