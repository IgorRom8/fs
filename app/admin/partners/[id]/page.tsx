import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { togglePublished, updatePartner } from "../../actions";
import { requireAdmin } from "@/src/shared/lib/admin";
import { db } from "@/src/shared/lib/db";
import { partnersTable } from "@/src/shared/lib/db/schema";
import { FileDropzone } from "@/src/shared/ui/file-dropzone";

export const dynamic = "force-dynamic";

export default async function EditPartner({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [item] = await db().select().from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
  if (!item) notFound();
  const logo = item.logoId ? `/api/media/${item.logoId}` : item.logoPath;
  return <main className="admin-editor admin-edit-page"><div className="admin-edit-nav"><Link href="/admin">← К публикациям</Link><form action={togglePublished}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="type" value="partner"/><input type="hidden" name="published" value={String(!item.published)}/><button className="admin-publish">{item.published?"Снять с публикации":"Опубликовать"}</button></form></div><section className="admin-preview">{logo&&<div className="admin-preview-image admin-partner-logo"><Image src={logo} alt={item.title} fill sizes="760px" unoptimized /></div>}<span>{item.published?"Опубликовано":"Черновик"} · порядок {item.position}</span><h1>{item.title}</h1><p>{item.description}</p></section><h2>Редактирование</h2><form action={updatePartner}><input type="hidden" name="id" value={item.id}/><label>Название<input name="title" required defaultValue={item.title}/></label><label>Адрес записи<input name="slug" maxLength={100} defaultValue={item.slug}/></label><label>Краткое описание<textarea name="description" required rows={6} defaultValue={item.description}/></label><label>Порядок отображения <small>Чем меньше число, тем раньше карточка появится на сайте</small><input name="position" type="number" min="0" max="999" required defaultValue={item.position}/></label><FileDropzone name="logo" label="Заменить изображение — только один файл" maxFiles={1}/><button type="submit">Сохранить изменения</button></form></main>;
}
