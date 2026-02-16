import { NextRequest, NextResponse } from "next/server";
import { getOpenTasks, getAllTasks, createTask } from "@/lib/queries";
import { sendNotification } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const data = status ? await getAllTasks(status) : await getOpenTasks();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const task = await createTask(body);

  // Notify on urgent tasks
  if (task.priority === "urgent") {
    sendNotification({
      type: "task_urgent",
      title: task.title,
      description: task.description || undefined,
      priority: task.priority,
    });
  }

  return NextResponse.json(task, { status: 201 });
}
