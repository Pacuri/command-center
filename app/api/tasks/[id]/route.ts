import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask, completeTask } from "@/lib/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const task = await updateTask(parseInt(id), body);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteTask(parseInt(id));
  return NextResponse.json({ ok: true });
}
