import { NextRequest, NextResponse } from "next/server";
import { deleteEvent } from "@/lib/queries";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteEvent(parseInt(id));
  return NextResponse.json({ ok: true });
}
