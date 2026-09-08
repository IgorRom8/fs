"use server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/shared/lib/admin";
import { db } from "@/src/shared/lib/db";
import { auditLog, galleryAlbums, galleryMedia, media, newsItems, projectMedia, projectsTable } from "@/src/shared/lib/db/schema";
import { saveImage } from "@/src/shared/lib/media";

const text = z.string().trim().min(1);
const optionalText = z.string().trim().transform(value => value || null);
const area = z.string().trim().transform(value => value ? value.replace(/\s/g, "").replace(",", ".") : null).refine(value => value === null || (!Number.isNaN(Number(value)) && Number(value) >= 0), "Укажите корректную площадь");
const transliteration: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
function makeSlug(value: string) {
  const normalized = value.trim().toLowerCase().split("").map((char) => transliteration[char] ?? char).join("").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
  return normalized || `material-${Date.now()}`;
}

export async function createNews(form: FormData) {
  const user = await requireAdmin();
  const parsed = z.object({ slug: z.string().trim().max(100), title: text, excerpt: text, content: text, published: z.boolean() }).parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), excerpt: form.get("excerpt"), content: form.get("content"), published: form.get("published") === "on" });
  const data = { ...parsed, slug: makeSlug(parsed.slug || parsed.title) };
  const coverId = await saveImage(form.get("cover") as File, data.title);
  const [item] = await db().insert(newsItems).values({ ...data, content: data.content.split(/\r?\n\s*\r?\n/).filter(Boolean), coverId, publishedAt: data.published ? new Date() : null }).returning({ id: newsItems.id });
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "news", entityId: item.id });
  revalidatePath("/news"); redirect("/admin");
}

export async function createProject(form: FormData) {
  const user = await requireAdmin();
  const parsed = z.object({ slug: z.string().trim().max(100), title: text, category: text, location: text, description: text, developer: optionalText, facadeArea: area, floors: optionalText, sections: optionalText, status: text, published: z.boolean() }).parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), category: form.get("category"), location: form.get("location"), description: form.get("description"), developer: String(form.get("developer") ?? ""), facadeArea: String(form.get("facadeArea") ?? ""), floors: String(form.get("floors") ?? ""), sections: String(form.get("sections") ?? ""), status: form.get("status"), published: form.get("published") === "on" });
  const data = { ...parsed, slug: makeSlug(parsed.slug || parsed.title) };
  const [item] = await db().insert(projectsTable).values(data).returning({ id: projectsTable.id });
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 30);
  for (const [position, file] of files.entries()) { const mediaId = await saveImage(file, data.title); if (mediaId) await db().insert(projectMedia).values({ projectId: item.id, mediaId, position }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "project", entityId: item.id });
  revalidatePath("/portfolio"); redirect("/admin");
}

export async function createGalleryAlbum(form: FormData) {
  const user = await requireAdmin();
  const parsed = z.object({ title: text, year: z.coerce.number().int().min(2000).max(2100), published: z.boolean() }).parse({ title: form.get("title"), year: form.get("year"), published: form.get("published") === "on" });
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 50);
  if (!files.length) throw new Error("Добавьте хотя бы одну фотографию");
  const [album] = await db().insert(galleryAlbums).values(parsed).returning({ id: galleryAlbums.id });
  for (const [position, file] of files.entries()) { const mediaId = await saveImage(file, parsed.title); if (mediaId) await db().insert(galleryMedia).values({ albumId: album.id, mediaId, position }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "gallery", entityId: album.id });
  revalidatePath("/gallery"); redirect("/admin");
}

export async function updateNews(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = z.object({ slug: z.string().trim().max(100), title: text, excerpt: text, content: text }).parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), excerpt: form.get("excerpt"), content: form.get("content") });
  const [current] = await db().select({ coverId: newsItems.coverId }).from(newsItems).where(eq(newsItems.id, id)).limit(1);
  if (!current) throw new Error("Новость не найдена");
  const file = form.get("cover");
  const coverId = file instanceof File && file.size > 0 ? await saveImage(file, parsed.title) : current.coverId;
  await db().update(newsItems).set({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), content: parsed.content.split(/\r?\n\s*\r?\n/).filter(Boolean), coverId, updatedAt: new Date() }).where(eq(newsItems.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "news", entityId: id });
  revalidatePath("/news"); revalidatePath("/admin"); redirect(`/admin/news/${id}`);
}

export async function updateProject(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = z.object({ slug: z.string().trim().max(100), title: text, category: text, location: text, description: text, developer: optionalText, facadeArea: area, floors: optionalText, sections: optionalText, status: text }).parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), category: form.get("category"), location: form.get("location"), description: form.get("description"), developer: String(form.get("developer") ?? ""), facadeArea: String(form.get("facadeArea") ?? ""), floors: String(form.get("floors") ?? ""), sections: String(form.get("sections") ?? ""), status: form.get("status") });
  await db().update(projectsTable).set({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), updatedAt: new Date() }).where(eq(projectsTable.id, id));
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 30);
  if (files.length) {
    const old = await db().select({ id: projectMedia.mediaId }).from(projectMedia).where(eq(projectMedia.projectId, id));
    await db().delete(projectMedia).where(eq(projectMedia.projectId, id));
    if (old.length) await db().delete(media).where(inArray(media.id, old.map((item) => item.id)));
    for (const [position, file] of files.entries()) { const mediaId = await saveImage(file, parsed.title); if (mediaId) await db().insert(projectMedia).values({ projectId: id, mediaId, position }); }
  }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "project", entityId: id });
  revalidatePath("/portfolio"); revalidatePath("/admin"); redirect(`/admin/projects/${id}`);
}

export async function updateGalleryAlbum(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = z.object({ title: text, year: z.coerce.number().int().min(2000).max(2100) }).parse({ title: form.get("title"), year: form.get("year") });
  await db().update(galleryAlbums).set({ ...parsed, updatedAt: new Date() }).where(eq(galleryAlbums.id, id));
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 50);
  if (files.length) {
    const [last] = await db().select({ position: galleryMedia.position }).from(galleryMedia).where(eq(galleryMedia.albumId, id)).orderBy(desc(galleryMedia.position)).limit(1);
    const startPosition = (last?.position ?? -1) + 1;
    for (const [index, file] of files.entries()) { const mediaId = await saveImage(file, parsed.title); if (mediaId) await db().insert(galleryMedia).values({ albumId: id, mediaId, position: startPosition + index }); }
  }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "gallery", entityId: id });
  revalidatePath("/gallery"); revalidatePath("/admin"); redirect(`/admin/gallery/${id}`);
}

export async function deleteGalleryPhoto(form: FormData) {
  const user = await requireAdmin();
  const albumId = z.string().uuid().parse(form.get("albumId"));
  const mediaId = z.string().uuid().parse(form.get("mediaId"));
  await db().delete(galleryMedia).where(and(eq(galleryMedia.albumId, albumId), eq(galleryMedia.mediaId, mediaId)));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "remove-photo", entityType: "gallery", entityId: albumId });
  revalidatePath("/gallery"); revalidatePath(`/admin/gallery/${albumId}`); revalidatePath("/admin");
}

export async function togglePublished(form: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(form.get("id")); const type = z.enum(["news", "project", "gallery"]).parse(form.get("type")); const published = form.get("published") === "true";
  if (type === "news") await db().update(newsItems).set({ published, publishedAt: published ? new Date() : null, updatedAt: new Date() }).where(eq(newsItems.id, id));
  else if (type === "project") await db().update(projectsTable).set({ published, updatedAt: new Date() }).where(eq(projectsTable.id, id));
  else await db().update(galleryAlbums).set({ published, updatedAt: new Date() }).where(eq(galleryAlbums.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: published ? "publish" : "unpublish", entityType: type, entityId: id });
  revalidatePath(type === "news" ? "/news" : type === "project" ? "/portfolio" : "/gallery"); revalidatePath("/admin");
}

export async function deleteEntry(form: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(form.get("id")); const type = z.enum(["news", "project", "gallery"]).parse(form.get("type"));
  if (type === "news") await db().delete(newsItems).where(eq(newsItems.id, id)); else if (type === "project") await db().delete(projectsTable).where(eq(projectsTable.id, id)); else await db().delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "delete", entityType: type, entityId: id });
  revalidatePath(type === "news" ? "/news" : type === "project" ? "/portfolio" : "/gallery"); revalidatePath("/admin");
}
