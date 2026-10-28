import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function normalizeDatabaseUrl(value: string) {
  try {
    const parsed = new URL(value);
    const repairMalformedEscapes = (part: string) =>
      part.replace(/%(?![0-9a-f]{2})/gi, "%25");

    parsed.username = repairMalformedEscapes(parsed.username);
    parsed.password = repairMalformedEscapes(parsed.password);
    return parsed.toString();
  } catch {
    throw new Error(
      "DATABASE_URL имеет некорректный формат. Проверьте postgresql://USER:PASSWORD@HOST:PORT/DB",
    );
  }
}

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  return value ? normalizeDatabaseUrl(value) : undefined;
}
export function hasDatabase() { return Boolean(databaseUrl()); }
export function db() { const url = databaseUrl(); if (!url) throw new Error("Database URL is not configured"); if (!database) database = drizzle(postgres(url, { max: 5, prepare: false }), { schema }); return database; }
