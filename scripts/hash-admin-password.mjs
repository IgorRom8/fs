import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

function readSecret(prompt) {
  if (!process.stdin.isTTY) return new Promise((resolve) => {
    let value = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => value += chunk);
    process.stdin.on("end", () => resolve(value.trimEnd()));
  });
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let value = "";
    const onData = (input) => {
      for (const key of input) {
        if (key === "\u0003") process.exit(130);
        if (key === "\r" || key === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (key === "\u007f" || key === "\b") {
          value = value.slice(0, -1);
        } else if (key.charCodeAt(0) >= 32) {
          value += key;
        }
      }
    };
    process.stdin.on("data", onData);
  });
}

const password = await readSecret("Введите новый пароль администратора (ввод скрыт): ");
if (password.length < 16) {
  console.error("Пароль должен содержать не менее 16 символов.");
  process.exit(1);
}
const confirmation = await readSecret("Повторите пароль (ввод скрыт): ");
if (password !== confirmation) {
  console.error("Пароли не совпадают. Хеш не был изменён.");
  process.exit(1);
}
const salt = randomBytes(32);
const hash = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const encoded = `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
const envPath = new URL("../.env.local", import.meta.url);
const source = await readFile(envPath, "utf8");
const line = `ADMIN_PASSWORD_HASH=${encoded}`;
const updated = /^ADMIN_PASSWORD_HASH=.*$/m.test(source)
  ? source.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line)
  : `${source.trimEnd()}\n${line}\n`;
await writeFile(envPath, updated, "utf8");
console.log("Новый хеш сохранён в .env.local. Перезапустите сервер.");
