import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/shared/lib/admin";
import { db } from "@/src/shared/lib/db";
import { media, projectMedia, projectsTable } from "@/src/shared/lib/db/schema";
import { PhotoUploadForm } from "@/src/shared/ui/photo-upload-form";
import { SortablePhotoGrid } from "@/src/shared/ui/sortable-photo-grid";
import { addProjectPhotos, deleteProjectPhoto, reorderProjectPhotos, togglePublished, updateProject } from "../../actions";
export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params;
  const [item] = await db().select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1); if (!item) notFound();
  const images = await db().select({ id: media.id }).from(projectMedia).innerJoin(media, eq(projectMedia.mediaId, media.id)).where(eq(projectMedia.projectId, id)).orderBy(asc(projectMedia.position));
  const addPhotos = addProjectPhotos.bind(null, item.id);
  const saveOrder = reorderProjectPhotos.bind(null, item.id);
  const removePhoto = deleteProjectPhoto.bind(null, item.id);
  const photos = images.map((image, index) => ({ id: image.id, src: `/api/media/${image.id}`, alt: `${item.title}, фото ${index + 1}` }));
  return <main className="admin-editor admin-edit-page"><div className="admin-edit-nav"><Link href="/admin">← К публикациям</Link><form action={togglePublished}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="type" value="project"/><input type="hidden" name="published" value={String(!item.published)}/><button className="admin-publish">{item.published?"Снять с публикации":"Опубликовать"}</button></form></div><section className="admin-preview admin-project-preview">{images.length>0&&<div className="admin-preview-gallery">{images.map(image=><div key={image.id}><Image src={`/api/media/${image.id}`} alt="" fill sizes="380px" unoptimized/></div>)}</div>}<span>{item.published?"Опубликовано":"Черновик"} · {item.category} · {item.status}</span><h1>{item.title}</h1><p>{item.location} — {item.description}</p></section><section className="admin-media-manager"><h2>Фотографии объекта</h2><PhotoUploadForm action={addPhotos} maxFiles={30}/>{photos.length>0?<SortablePhotoGrid photos={photos} saveOrder={saveOrder} deletePhoto={removePhoto}/>:<p className="admin-empty">Фотографий пока нет.</p>}</section><h2>Редактирование</h2><form action={updateProject}><input type="hidden" name="id" value={item.id}/><label>Название<input name="title" required defaultValue={item.title}/></label><label>Адрес страницы<input name="slug" maxLength={100} defaultValue={item.slug}/></label><div className="admin-fields"><label>Категория<input name="category" required defaultValue={item.category}/></label><label>Город<input name="location" required defaultValue={item.location}/></label></div><div className="admin-fields"><label>Застройщик<input name="developer" defaultValue={item.developer??""}/></label><label>Статус<input name="status" required defaultValue={item.status}/></label></div><div className="admin-fields"><label>Площадь фасадов, м²<input name="facadeArea" inputMode="decimal" defaultValue={item.facadeArea?.replace(".",",")??""}/></label><label>Этажность<input name="floors" defaultValue={item.floors??""}/></label></div><label>Количество секций<input name="sections" defaultValue={item.sections??""}/></label><label>Описание<textarea name="description" required rows={8} defaultValue={item.description}/></label><button type="submit">Сохранить изменения</button></form></main>;
}
