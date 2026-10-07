"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/src/features/admin-auth";
import { makeSlug, requiredText } from "@/src/shared/lib/content-validation";
import { db } from "@/src/shared/lib/db";
import { auditLog, media, partnersTable } from "@/src/shared/lib/db/schema";
import { saveImage } from "@/src/shared/lib/media";

const partnerSchema = z.object({
  slug: z.string().trim().max(100), title: requiredText, description: requiredText,
  position: z.coerce.number().int().min(0).max(999),
});

export async function createPartner(form: FormData) {
  const user = await requireAdmin();
  const parsed = partnerSchema.extend({ published: z.boolean() }).parse({
    slug: String(form.get("slug") ?? ""), title: form.get("title"), description: form.get("description"),
    position: form.get("position"), published: form.get("published") === "on",
  });
  const logo = form.get("logo");
  if (!(logo instanceof File) || !logo.size) throw new Error("Добавьте логотип партнёра");
  const logoId = await saveImage(logo, parsed.title);
  const [item] = await db().insert(partnersTable).values({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), logoId }).returning({ id: partnersTable.id });
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "create", entityType: "partner", entityId: item.id });
  revalidatePath("/partners"); revalidatePath("/admin"); redirect("/admin");
}

export async function updatePartner(form: FormData) {
  const user = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const parsed = partnerSchema.parse({ slug: String(form.get("slug") ?? ""), title: form.get("title"), description: form.get("description"), position: form.get("position") });
  const [current] = await db().select({ logoId: partnersTable.logoId }).from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
  if (!current) throw new Error("Партнёр не найден");
  const file = form.get("logo");
  const logoId = file instanceof File && file.size > 0 ? await saveImage(file, parsed.title) : current.logoId;
  await db().update(partnersTable).set({ ...parsed, slug: makeSlug(parsed.slug || parsed.title), logoId, updatedAt: new Date() }).where(eq(partnersTable.id, id));
  if (logoId && current.logoId && logoId !== current.logoId) await db().delete(media).where(eq(media.id, current.logoId));
  await db().insert(auditLog).values({ actorEmail: user.email!, action: "update", entityType: "partner", entityId: id });
  revalidatePath("/partners"); revalidatePath("/admin"); redirect(`/admin/partners/${id}`);
}
