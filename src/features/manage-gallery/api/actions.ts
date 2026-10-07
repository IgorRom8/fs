"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/features/admin-auth";
import { requiredText } from "@/src/shared/lib/content-validation";
import { db } from "@/src/shared/lib/db";
import { auditLog, galleryAlbums, galleryMedia, media } from "@/src/shared/lib/db/schema";
import { saveImage } from "@/src/shared/lib/media";

const gallerySchema = z.object({ title: requiredText, year: z.coerce.number().int().min(2000).max(2100) });
const imageFiles = (form: FormData) => form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 100);

export async function createGalleryAlbum(form: FormData) {
  const user = await requireAdmin();
  const parsed = gallerySchema.extend({ published: z.boolean() }).parse({ title: form.get("title"), year: form.get("year"), published: form.get("published") === "on" });
  const files = imageFiles(form);
  if (!files.length) throw new Error("Добавьте хотя бы одну фотографию");
  const [album] = await db().insert(galleryAlbums).values(parsed).returning({ id: galleryAlbums.id });
  for (const [position, file] of files.entries()) { const mediaId = await saveImage(file, parsed.title); if (mediaId) await db().insert(galleryMedia).values({ albumId: album.id, mediaId, position }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "gallery", entityId: album.id });
  revalidatePath("/gallery"); redirect("/admin");
}

export async function updateGalleryAlbum(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = gallerySchema.parse({ title: form.get("title"), year: form.get("year") });
  await db().update(galleryAlbums).set({ ...parsed, updatedAt: new Date() }).where(eq(galleryAlbums.id, id));
  const files = imageFiles(form);
  if (files.length) {
    const [last] = await db().select({ position: galleryMedia.position }).from(galleryMedia).where(eq(galleryMedia.albumId, id)).orderBy(desc(galleryMedia.position)).limit(1);
    for (const [index, file] of files.entries()) { const mediaId = await saveImage(file, parsed.title); if (mediaId) await db().insert(galleryMedia).values({ albumId: id, mediaId, position: (last?.position ?? -1) + 1 + index }); }
  }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "gallery", entityId: id });
  revalidatePath("/gallery"); revalidatePath("/admin"); redirect(`/admin/gallery/${id}`);
}

export async function addGalleryPhotos(albumId: string, form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(albumId);
  const [album] = await db().select({ title: galleryAlbums.title }).from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
  if (!album) throw new Error("Альбом не найден");
  const files = imageFiles(form);
  if (!files.length) throw new Error("Добавьте хотя бы одну фотографию");
  const [last] = await db().select({ position: galleryMedia.position }).from(galleryMedia).where(eq(galleryMedia.albumId, id)).orderBy(desc(galleryMedia.position)).limit(1);
  for (const [index, file] of files.entries()) { const mediaId = await saveImage(file, album.title); if (mediaId) await db().insert(galleryMedia).values({ albumId: id, mediaId, position: (last?.position ?? -1) + 1 + index }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "add-photos", entityType: "gallery", entityId: id });
  revalidatePath("/gallery"); revalidatePath(`/admin/gallery/${id}`); revalidatePath("/admin");
}

export async function reorderGalleryPhotos(albumId: string, orderedIds: string[]) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(albumId);
  const ids = z.array(z.string().uuid()).max(200).parse(orderedIds);
  if (new Set(ids).size !== ids.length) throw new Error("Порядок содержит повторяющиеся фотографии");
  const rows = await db().select({ id: galleryMedia.mediaId }).from(galleryMedia).where(eq(galleryMedia.albumId, id));
  const currentIds = new Set(rows.map((row) => row.id));
  if (ids.length !== currentIds.size || ids.some((mediaId) => !currentIds.has(mediaId))) throw new Error("Список фотографий изменился. Обновите страницу");
  await db().transaction(async (transaction) => { for (const [position, mediaId] of ids.entries()) await transaction.update(galleryMedia).set({ position }).where(and(eq(galleryMedia.albumId, id), eq(galleryMedia.mediaId, mediaId))); });
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "reorder-photos", entityType: "gallery", entityId: id });
  revalidatePath("/gallery"); revalidatePath(`/admin/gallery/${id}`);
}

export async function removeGalleryPhoto(albumId: string, mediaId: string) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(albumId);
  const photoId = z.string().uuid().parse(mediaId);
  await db().delete(galleryMedia).where(and(eq(galleryMedia.albumId, id), eq(galleryMedia.mediaId, photoId)));
  await db().delete(media).where(eq(media.id, photoId));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "remove-photo", entityType: "gallery", entityId: id });
  revalidatePath("/gallery"); revalidatePath(`/admin/gallery/${id}`);
}
