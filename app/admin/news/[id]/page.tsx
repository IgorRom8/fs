import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/shared/lib/admin";
import { db } from "@/src/shared/lib/db";
import { newsItems } from "@/src/shared/lib/db/schema";
import { FileDropzone } from "@/src/shared/ui/file-dropzone";
import { togglePublished, updateNews } from "../../actions";
export const dynamic = "force-dynamic";

export default async function EditNews({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params;
  const [item] = await db().select().from(newsItems).where(eq(newsItems.id, id)).limit(1); if (!item) notFound();
  const cover = item.coverId ? `/api/media/${item.coverId}` : null;
  return <main className="admin-editor admin-edit-page"><div className="admin-edit-nav"><Link href="/admin">← К публикациям</Link><form action={togglePublished}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="type" value="news"/><input type="hidden" name="published" value={String(!item.published)}/><button className="admin-publish">{item.published?"Снять с публикации":"Опубликовать"}</button></form></div><section className="admin-preview">{cover&&<div className="admin-preview-image"><Image src={cover} alt="" fill sizes="760px" unoptimized/></div>}<span>{item.published?"Опубликовано":"Черновик"}</span><h1>{item.title}</h1><p>{item.excerpt}</p></section><h2>Редактирование</h2><form action={updateNews}><input type="hidden" name="id" value={item.id}/><label>Заголовок<input name="title" required defaultValue={item.title}/></label><label>Адрес страницы<input name="slug" maxLength={100} defaultValue={item.slug}/></label><label>Краткое описание<textarea name="excerpt" required rows={3} defaultValue={item.excerpt}/></label><label>Текст новости<textarea name="content" required rows={12} defaultValue={item.content.join("\n\n")}/></label><FileDropzone name="cover" label="Новая обложка — необязательно"/><button type="submit">Сохранить изменения</button></form></main>;
}
