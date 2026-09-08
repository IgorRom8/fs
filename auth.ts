import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/src/shared/lib/db";
import { adminLoginAttempts } from "@/src/shared/lib/db/schema";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 30 * 60 * 1000;
const credentialsSchema = z.object({ username: z.string().trim().min(1).max(128), password: z.string().min(1).max(1024) });

function attemptKey(username: string, request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", process.env.AUTH_SECRET || "missing-secret").update(`${username}|${ip}`).digest("hex");
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltHex, hashHex] = encoded.split(":");
  if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== 64) return false;
    const actual = await new Promise<Buffer>((resolve, reject) => scryptCallback(password, Buffer.from(saltHex, "hex"), expected.length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derivedKey) => error ? reject(error) : resolve(derivedKey)));
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

async function getAttempt(key: string) {
  const [attempt] = await db().select().from(adminLoginAttempts).where(eq(adminLoginAttempts.key, key)).limit(1);
  return attempt;
}

async function recordFailure(key: string) {
  const now = new Date();
  const attempt = await getAttempt(key);
  const windowExpired = !attempt || now.getTime() - attempt.windowStartedAt.getTime() > WINDOW_MS;
  const failedCount = windowExpired ? 1 : attempt.failedCount + 1;
  const values = { failedCount, windowStartedAt: windowExpired ? now : attempt.windowStartedAt, blockedUntil: failedCount >= MAX_ATTEMPTS ? new Date(now.getTime() + BLOCK_MS) : null, updatedAt: now };
  await db().insert(adminLoginAttempts).values({ key, ...values }).onConflictDoUpdate({ target: adminLoginAttempts.key, set: values });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({
    credentials: { username: { label: "Логин", type: "text" }, password: { label: "Пароль", type: "password" } },
    async authorize(rawCredentials, request) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;
      const username = parsed.data.username.toLocaleLowerCase("ru-RU");
      const key = attemptKey(username, request);
      const attempt = await getAttempt(key);
      const blocked = Boolean(attempt?.blockedUntil && attempt.blockedUntil.getTime() > Date.now());
      const configuredUsername = process.env.ADMIN_USERNAME?.trim().toLocaleLowerCase("ru-RU") ?? "";
      const configuredHash = process.env.ADMIN_PASSWORD_HASH ?? "";
      const passwordMatches = await verifyPassword(parsed.data.password, configuredHash);
      const usernameBuffer = Buffer.from(username);
      const configuredBuffer = Buffer.from(configuredUsername);
      const usernameMatches = usernameBuffer.length === configuredBuffer.length && timingSafeEqual(usernameBuffer, configuredBuffer);
      if (blocked || !usernameMatches || !passwordMatches) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[admin-auth] login rejected", { blocked, usernameMatches, passwordMatches });
        }
        await recordFailure(key);
        return null;
      }
      await db().delete(adminLoginAttempts).where(eq(adminLoginAttempts.key, key));
      return { id: "admin", name: process.env.ADMIN_USERNAME, email: `${username}@admin.local` };
    },
  })],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    jwt({ token, user }) { if (user) token.role = "admin"; return token; },
    session({ session, token }) { if (session.user && token.role === "admin") session.user.role = "admin"; return session; },
  },
  cookies: { sessionToken: { name: process.env.NODE_ENV === "production" ? "__Secure-fs.session-token" : "fs.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" } } },
});
