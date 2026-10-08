import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

if (!process.env.DATABASE_URL && existsSync(resolve(".env.local"))) loadEnvFile(resolve(".env.local"));
if (process.env.DATABASE_BACKUPS_ENABLED !== "true") throw new Error("Резервные копии не подтверждены: DATABASE_BACKUPS_ENABLED=true");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL не настроен");
if (!process.env.BACKUP_DIR) throw new Error("BACKUP_DIR не настроен");

const databaseUrl = new URL(process.env.DATABASE_URL);
const backupDirectory = resolve(process.env.BACKUP_DIR);
await mkdir(backupDirectory, { recursive: true });

const stamp = new Date().toISOString().replaceAll(":", "-").replace(".000Z", "Z");
const output = resolve(backupDirectory, `fasadnaya-simfoniya-${stamp}.dump`);
const args = [
  "--host", databaseUrl.hostname,
  "--port", databaseUrl.port || "5432",
  "--username", decodeURIComponent(databaseUrl.username),
  "--dbname", decodeURIComponent(databaseUrl.pathname.slice(1)),
  "--format=custom",
  "--no-password",
  "--file", output,
];
const environment = {
  ...process.env,
  PGPASSWORD: decodeURIComponent(databaseUrl.password),
  PGSSLMODE: databaseUrl.searchParams.get("sslmode") || process.env.PGSSLMODE || "prefer",
};

await new Promise((resolvePromise, reject) => {
  const child = spawn("pg_dump", args, { env: environment, stdio: "inherit", windowsHide: true });
  child.on("error", (error) => reject(new Error(`Не удалось запустить pg_dump: ${error.message}`)));
  child.on("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(`pg_dump завершился с кодом ${code}`)));
});

console.log(`Резервная копия создана: ${output}`);
