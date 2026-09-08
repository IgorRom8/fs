import postgres from "postgres";

const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
const username = process.env.ADMIN_USERNAME ?? "";
const parts = hash.split(":");
console.log(JSON.stringify({
  usernamePresent: Boolean(username),
  usernameLength: username.length,
  usernameHasOuterWhitespace: username !== username.trim(),
  usernameHasQuotes: username.startsWith('"') || username.startsWith("'") || username.endsWith('"') || username.endsWith("'"),
  usernameContainsAssignment: username.includes("="),
  usernameLooksLikeEmail: username.includes("@"),
  hashPresent: Boolean(hash),
  hashParts: parts.length,
  algorithm: parts[0] || null,
  saltHexLength: parts[1]?.length ?? 0,
  hashHexLength: parts[2]?.length ?? 0,
  hashValid: parts.length === 3 && parts[0] === "scrypt" && /^[0-9a-f]{64}$/i.test(parts[1] ?? "") && /^[0-9a-f]{128}$/i.test(parts[2] ?? ""),
}));

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const rows = await sql`select to_regclass('public.admin_login_attempts') as table_name`;
  const tableExists = Boolean(rows[0].table_name);
  console.log(JSON.stringify({ loginAttemptsTableExists: tableExists }));
  if (tableExists) {
    const attempts = await sql`select count(*)::int as total, count(*) filter (where blocked_until > now())::int as blocked from admin_login_attempts`;
    console.log(JSON.stringify({ attempts: attempts[0].total, activeBlocks: attempts[0].blocked }));
  }
} catch (error) {
  console.log(JSON.stringify({ databaseCheckError: error.code ?? "unknown" }));
} finally {
  await sql.end();
}
