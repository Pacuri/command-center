import { NextRequest, NextResponse } from "next/server";
import { getUnreadInbox, getAllInbox, pushInbox } from "@/lib/queries";
import { sendNotification } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get("all");
  const data = all ? await getAllInbox() : await getUnreadInbox();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await pushInbox(body);

  // Notify on agent inbox items
  if (item.source === "agent") {
    sendNotification({
      type: "inbox_new",
      title: item.title,
      description: item.description || undefined,
    });
  }

  return NextResponse.json(item, { status: 201 });
}
