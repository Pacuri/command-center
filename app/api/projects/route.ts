import { NextRequest, NextResponse } from "next/server";
import { getActiveProjects, getAllProjects, createProject } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get("all");
  const data = all ? await getAllProjects() : await getActiveProjects();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await createProject(body);
  return NextResponse.json(project, { status: 201 });
}
