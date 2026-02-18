import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL!;

// postgres.js client — works with Supabase pooler in serverless
const client = postgres(connectionString, {
  prepare: false, // required for Supabase transaction pooler
});

export const db = drizzle(client, { schema });
