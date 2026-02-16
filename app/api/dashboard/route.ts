import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/queries";

export async function GET() {
  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
