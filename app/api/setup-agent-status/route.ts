import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS agent_status (
        id integer PRIMARY KEY DEFAULT 1,
        active boolean DEFAULT false,
        last_active timestamptz DEFAULT now(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `);
    await db.execute(sql`
      INSERT INTO agent_status (id, active, last_active)
      VALUES (1, false, now())
      ON CONFLICT (id) DO NOTHING
    `);
    return NextResponse.json({ ok: true, message: "agent_status table created" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
