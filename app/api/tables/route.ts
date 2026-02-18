import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const tables = await db.execute(sql`
      SELECT
        t.table_schema,
        t.table_name,
        (SELECT count(*)::int FROM information_schema.columns c
         WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count,
        pg_stat.n_live_tup::int as row_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables pg_stat
        ON pg_stat.schemaname = t.table_schema AND pg_stat.relname = t.table_name
      WHERE t.table_schema IN ('public', 'cc')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name
    `);

    return NextResponse.json(tables);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
