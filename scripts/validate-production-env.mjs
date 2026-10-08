import { access } from "node:fs/promises";
import { constants } from "node:fs";
import postgres from "postgres";

const errors = [];
const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "AUTH_URL",
  "AUTH_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD_HASH",
  "DATABASE_BACKUPS_ENABLED",
  "BACKUP_DIR",
];

for (const name of required) {
  if (!process.env[name]?.trim()) errors.push(`${name} не задана`);
}

function httpsUrl(name) {
  const value = process.env[name];
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") errors.push(`${name} должна использовать https://`);
    return url;
  } catch {
    errors.push(`${name} содержит некорректный URL`);
    return null;
  }
}

const publicUrl = httpsUrl("NEXT_PUBLIC_SITE_URL");
const authUrl = httpsUrl("AUTH_URL");
if (publicUrl && authUrl && publicUrl.origin !== authUrl.origin) {
  errors.push("NEXT_PUBLIC_SITE_URL и AUTH_URL должны указывать на один домен");
}

if ((process.env.AUTH_SECRET?.length ?? 0) < 32 || process.env.AUTH_SECRET?.includes("replace-with")) {
  errors.push("AUTH_SECRET должен быть случайной строкой длиной не менее 32 символов");
}
if (!process.env.ADMIN_PASSWORD_HASH?.startsWith("scrypt:") || process.env.ADMIN_PASSWORD_HASH?.includes("replace-with")) {
  errors.push("ADMIN_PASSWORD_HASH должен быть создан командой npm run admin:hash");
}
if (process.env.DATABASE_BACKUPS_ENABLED !== "true") {
  errors.push("DATABASE_BACKUPS_ENABLED должен быть равен true после настройки резервных копий");
}

if (process.env.BACKUP_DIR) {
  try {
    await access(process.env.BACKUP_DIR, constants.W_OK);
  } catch {
    errors.push(`BACKUP_DIR недоступна для записи: ${process.env.BACKUP_DIR}`);
  }
}

if (errors.length === 0) {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    await sql`select 1`;
  } catch (error) {
    errors.push(`не удалось подключиться к PostgreSQL: ${error.message}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (errors.length > 0) {
  console.error("Production-проверка не пройдена:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production-проверка пройдена: HTTPS URL, секреты и PostgreSQL настроены; политика резервных копий подтверждена.");
