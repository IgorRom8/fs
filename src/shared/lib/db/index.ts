import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;
export function hasDatabase() { return Boolean(process.env.DATABASE_URL); }
export function db() { if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured"); if (!database) database = drizzle(postgres(process.env.DATABASE_URL, { max: 5, prepare: false }), { schema }); return database; }
