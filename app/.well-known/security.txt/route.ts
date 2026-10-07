import { absoluteUrl } from "@/src/shared/lib/site";

export const dynamic = "force-dynamic";

export function GET() {
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + 180);
  const body = [
    `Contact: ${absoluteUrl("/contacts")}`,
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    "Preferred-Languages: ru",
    `Expires: ${expires.toISOString()}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
