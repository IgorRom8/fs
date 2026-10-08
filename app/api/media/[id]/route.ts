import { db } from "@/src/shared/lib/db";
import { media } from "@/src/shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const mediaIdSchema = z.uuid();

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = mediaIdSchema.safeParse((await params).id);

  if (!result.success) {
    return Response.json({ error: "Некорректный идентификатор файла" }, { status: 400 });
  }

  const [file] = await db()
    .select()
    .from(media)
    .where(eq(media.id, result.data))
    .limit(1);

  if (!file) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
