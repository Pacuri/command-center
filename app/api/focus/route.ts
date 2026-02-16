import { NextRequest, NextResponse } from "next/server";
import { getCurrentFocus, setFocus } from "@/lib/queries";

export async function GET() {
  const current = await getCurrentFocus();
  return NextResponse.json(current);
}

export async function POST(request: NextRequest) {
  const { content } = await request.json();
  const f = await setFocus(content);
  return NextResponse.json(f, { status: 201 });
}
