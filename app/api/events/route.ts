import { NextRequest, NextResponse } from "next/server";
import { getEvents, getEventsForMonth, createEvent } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const year = request.nextUrl.searchParams.get("year");

  if (month && year) {
    const data = await getEventsForMonth(parseInt(year), parseInt(month));
    return NextResponse.json(data);
  }

  const from = request.nextUrl.searchParams.get("from") || undefined;
  const data = await getEvents(from);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = await createEvent(body);
  return NextResponse.json(event, { status: 201 });
}
