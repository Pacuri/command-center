import { NextRequest } from "next/server";

export function verifyMcpAuth(request: NextRequest): boolean {
  // Check Bearer token header first
  const auth = request.headers.get("authorization");
  if (auth) {
    const token = auth.replace("Bearer ", "");
    if (token === process.env.MCP_SECRET) return true;
  }
  // Fall back to query param ?key=
  const key = request.nextUrl.searchParams.get("key");
  if (key === process.env.MCP_SECRET) return true;
  return false;
}
