import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;
function databaseUrl() {
  return process.env.VERCEL
    ? process.env.DATABASE_URL_NEON ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL ?? process.env.DATABASE_URL_NEON;
}
export function hasDatabase() { return Boolean(databaseUrl()); }
export function db() { const url = databaseUrl(); if (!url) throw new Error("Database URL is not configured"); if (!database) database = drizzle(postgres(url, { max: 5, prepare: false }), { schema }); return database; }
