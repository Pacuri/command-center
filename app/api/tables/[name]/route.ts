import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // Parse schema.table format (e.g., "cc.tasks" or "public.memory")
    let schema = "public";
    let table = name;
    if (name.includes(".")) {
      [schema, table] = name.split(".");
    }

    // Validate schema
    if (!["public", "cc"].includes(schema)) {
      return NextResponse.json({ error: "Invalid schema" }, { status: 400 });
    }

    // Validate table name (prevent SQL injection — alphanumeric + underscores only)
    if (!/^[a-z_][a-z0-9_]*$/.test(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    // Get column info
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = ${schema} AND table_name = ${table}
      ORDER BY ordinal_position
    `);

    // Get rows (limit 50, newest first)
    const rows = await db.execute(
      sql.raw(`SELECT * FROM "${schema}"."${table}" ORDER BY 1 DESC LIMIT 50`)
    );

    return NextResponse.json({ schema, table, columns, rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
