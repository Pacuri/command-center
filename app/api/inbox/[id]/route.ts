import { NextRequest, NextResponse } from "next/server";
import { markInboxRead } from "@/lib/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await markInboxRead(parseInt(id));
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
