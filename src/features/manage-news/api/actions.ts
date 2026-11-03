"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/features/admin-auth";
import { makeSlug, requiredText } from "@/src/shared/lib/content-validation";
import { db } from "@/src/shared/lib/db";
import { auditLog, newsItems } from "@/src/shared/lib/db/schema";
import { saveImage } from "@/src/shared/lib/media";

const newsSchema = z.object({
  slug: z.string().trim().max(100),
  title: requiredText,
  excerpt: requiredText,
  content: requiredText,
});

const publicationDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату публикации");

export async function createNews(form: FormData) {
  const user = await requireAdmin();
  const parsed = newsSchema.extend({ published: z.boolean(), publicationDate }).parse({
    slug: String(form.get("slug") ?? ""), title: form.get("title"), excerpt: form.get("excerpt"),
    content: form.get("content"), published: form.get("published") === "on",
    publicationDate: String(form.get("publicationDate") ?? new Date().toISOString().slice(0, 10)),
  });
  const { publicationDate, ...data } = parsed;
  const coverId = await saveImage(form.get("cover") as File, data.title);
  const [item] = await db().insert(newsItems).values({ ...data, content: data.content.split(/\r?\n\s*\r?\n/).filter(Boolean), coverId, publishedAt: data.published ? new Date(`${publicationDate}T09:00:00+03:00`) : null }).returning({ id: newsItems.id });
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "news", entityId: item.id });
  revalidatePath("/news");
  redirect("/admin");
}

export async function updateNews(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = newsSchema.parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), excerpt: form.get("excerpt"), content: form.get("content") });
  const date = publicationDate.parse(String(form.get("publicationDate") ?? ""));
  const [current] = await db().select({ coverId: newsItems.coverId }).from(newsItems).where(eq(newsItems.id, id)).limit(1);
  if (!current) throw new Error("Новость не найдена");
  const file = form.get("cover");
  const coverId = file instanceof File && file.size > 0 ? await saveImage(file, parsed.title) : current.coverId;
  await db().update(newsItems).set({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), content: parsed.content.split(/\r?\n\s*\r?\n/).filter(Boolean), coverId, publishedAt: new Date(`${date}T09:00:00+03:00`), updatedAt: new Date() }).where(eq(newsItems.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "news", entityId: id });
  revalidatePath("/news");
  revalidatePath("/admin");
  redirect(`/admin/news/${id}`);
}
