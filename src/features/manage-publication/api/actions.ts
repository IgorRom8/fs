"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/src/features/admin-auth";
import { db } from "@/src/shared/lib/db";
import { auditLog, galleryAlbums, media, newsItems, partnersTable, projectsTable } from "@/src/shared/lib/db/schema";

const contentType = z.enum(["news", "project", "gallery", "partner"]);
type ContentType = z.infer<typeof contentType>;
const publicPath: Record<ContentType, string> = { news: "/news", project: "/portfolio", gallery: "/gallery", partner: "/partners" };

export async function togglePublished(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const type = contentType.parse(form.get("type"));
  const published = form.get("published") === "true";
  if (type === "news") await db().update(newsItems).set({ published, publishedAt: published ? new Date() : null, updatedAt: new Date() }).where(eq(newsItems.id, id));
  else if (type === "project") await db().update(projectsTable).set({ published, updatedAt: new Date() }).where(eq(projectsTable.id, id));
  else if (type === "gallery") await db().update(galleryAlbums).set({ published, updatedAt: new Date() }).where(eq(galleryAlbums.id, id));
  else await db().update(partnersTable).set({ published, updatedAt: new Date() }).where(eq(partnersTable.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: published ? "publish" : "unpublish", entityType: type, entityId: id });
  revalidatePath(publicPath[type]); revalidatePath("/admin");
}

export async function deleteEntry(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const type = contentType.parse(form.get("type"));
  const partnerLogoId = type === "partner" ? (await db().select({ logoId: partnersTable.logoId }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1))[0]?.logoId ?? null : null;
  if (type === "news") await db().delete(newsItems).where(eq(newsItems.id, id));
  else if (type === "project") await db().delete(projectsTable).where(eq(projectsTable.id, id));
  else if (type === "gallery") await db().delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  else await db().delete(partnersTable).where(eq(partnersTable.id, id));
  if (partnerLogoId) await db().delete(media).where(eq(media.id, partnerLogoId));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "delete", entityType: type, entityId: id });
  revalidatePath(publicPath[type]); revalidatePath("/admin");
}
