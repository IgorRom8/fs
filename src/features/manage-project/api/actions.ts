"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/features/admin-auth";
import { facadeArea, makeSlug, optionalText, requiredText } from "@/src/shared/lib/content-validation";
import { db } from "@/src/shared/lib/db";
import { auditLog, media, projectMedia, projectsTable } from "@/src/shared/lib/db/schema";
import { saveImage } from "@/src/shared/lib/media";

const projectSchema = z.object({
  slug: z.string().trim().max(100), title: requiredText, category: requiredText, location: requiredText,
  description: requiredText, developer: optionalText, facadeArea, floors: optionalText, sections: optionalText, status: requiredText,
});

function parseProject(form: FormData) {
  return projectSchema.parse({
    slug: String(form.get("slug") ?? ""), title: form.get("title"), category: form.get("category"), location: form.get("location"),
    description: form.get("description"), developer: String(form.get("developer") ?? ""), facadeArea: String(form.get("facadeArea") ?? ""),
    floors: String(form.get("floors") ?? ""), sections: String(form.get("sections") ?? ""), status: form.get("status"),
  });
}

export async function createProject(form: FormData) {
  const user = await requireAdmin();
  const parsed = parseProject(form);
  const data = { ...parsed, slug: makeSlug(parsed.slug || parsed.title), published: form.get("published") === "on" };
  const [item] = await db().insert(projectsTable).values(data).returning({ id: projectsTable.id });
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 100);
  for (const [position, file] of files.entries()) { const mediaId = await saveImage(file, data.title); if (mediaId) await db().insert(projectMedia).values({ projectId: item.id, mediaId, position }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "project", entityId: item.id });
  revalidatePath("/portfolio"); redirect("/admin");
}

export async function updateProject(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = parseProject(form);
  await db().update(projectsTable).set({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), updatedAt: new Date() }).where(eq(projectsTable.id, id));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "project", entityId: id });
  revalidatePath("/portfolio"); revalidatePath("/admin"); redirect(`/admin/projects/${id}`);
}

export async function addProjectPhotos(projectId: string, form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(projectId);
  const [project] = await db().select({ title: projectsTable.title, slug: projectsTable.slug }).from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!project) throw new Error("Объект не найден");
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 100);
  if (!files.length) throw new Error("Добавьте хотя бы одну фотографию");
  const [last] = await db().select({ position: projectMedia.position }).from(projectMedia).where(eq(projectMedia.projectId, id)).orderBy(desc(projectMedia.position)).limit(1);
  for (const [index, file] of files.entries()) { const mediaId = await saveImage(file, project.title); if (mediaId) await db().insert(projectMedia).values({ projectId: id, mediaId, position: (last?.position ?? -1) + 1 + index }); }
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "add-photos", entityType: "project", entityId: id });
  revalidatePath("/portfolio"); revalidatePath(`/portfolio/${project.slug}`); revalidatePath(`/admin/projects/${id}`); revalidatePath("/admin");
}

export async function reorderProjectPhotos(projectId: string, orderedIds: string[]) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(projectId);
  const ids = z.array(z.string().uuid()).max(200).parse(orderedIds);
  if (new Set(ids).size !== ids.length) throw new Error("Порядок содержит повторяющиеся фотографии");
  const rows = await db().select({ id: projectMedia.mediaId }).from(projectMedia).where(eq(projectMedia.projectId, id));
  const currentIds = new Set(rows.map((row) => row.id));
  if (ids.length !== currentIds.size || ids.some((mediaId) => !currentIds.has(mediaId))) throw new Error("Список фотографий изменился. Обновите страницу");
  await db().transaction(async (transaction) => { for (const [position, mediaId] of ids.entries()) await transaction.update(projectMedia).set({ position }).where(and(eq(projectMedia.projectId, id), eq(projectMedia.mediaId, mediaId))); });
  const [project] = await db().select({ slug: projectsTable.slug }).from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "reorder-photos", entityType: "project", entityId: id });
  revalidatePath("/portfolio"); if (project) revalidatePath(`/portfolio/${project.slug}`); revalidatePath(`/admin/projects/${id}`);
}

export async function deleteProjectPhoto(projectId: string, mediaId: string) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(projectId);
  const photoId = z.string().uuid().parse(mediaId);
  await db().delete(projectMedia).where(and(eq(projectMedia.projectId, id), eq(projectMedia.mediaId, photoId)));
  await db().delete(media).where(eq(media.id, photoId));
  const [project] = await db().select({ slug: projectsTable.slug }).from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "remove-photo", entityType: "project", entityId: id });
  revalidatePath("/portfolio"); if (project) revalidatePath(`/portfolio/${project.slug}`); revalidatePath(`/admin/projects/${id}`);
}
