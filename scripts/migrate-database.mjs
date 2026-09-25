import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_NEON;
if (!databaseUrl) throw new Error("DATABASE_URL или DATABASE_URL_NEON не настроен");

const directory = resolve("drizzle");
const migrations = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  for (const migration of migrations) {
    await sql.file(resolve(directory, migration));
    console.log(`Применена миграция: ${migration}`);
  }
} finally {
  await sql.end();
}
