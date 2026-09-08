import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { deleteGalleryPhoto, togglePublished, updateGalleryAlbum } from "../../actions";
import { requireAdmin } from "@/src/shared/lib/admin";
import { db } from "@/src/shared/lib/db";
import { galleryAlbums, galleryMedia, media } from "@/src/shared/lib/db/schema";
import { FileDropzone } from "@/src/shared/ui/file-dropzone";

export default async function EditGalleryAlbum({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const { id } = await params;
  const [item] = await db().select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1); if (!item) notFound();
  const images = await db().select({ id: media.id }).from(galleryMedia).innerJoin(media, eq(galleryMedia.mediaId, media.id)).where(eq(galleryMedia.albumId, id)).orderBy(asc(galleryMedia.position));
  return <main className="admin-editor admin-edit-page"><div className="admin-edit-nav"><Link href="/admin">← К публикациям</Link><form action={togglePublished}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="type" value="gallery"/><input type="hidden" name="published" value={String(!item.published)}/><button className="admin-publish">{item.published?"Снять с публикации":"Опубликовать"}</button></form></div><section className="admin-preview admin-project-preview">{images.length>0&&<div className="admin-preview-gallery">{images.map(image=><div key={image.id}><Image src={`/api/media/${image.id}`} alt="" fill sizes="380px" unoptimized/></div>)}</div>}<span>{item.published?"Опубликовано":"Черновик"} · {images.length} фотографий</span><h1>{item.title}</h1><p>Фотоархив за {item.year} год</p></section>{images.length>0&&<details className="admin-photo-list"><summary>Показать все фото <span>{images.length}</span></summary><div className="admin-photo-grid">{images.map((image,index)=><article key={image.id}><div><Image src={`/api/media/${image.id}`} alt={`${item.title}, фото ${index+1}`} fill sizes="240px" unoptimized/></div><span>Фото {String(index+1).padStart(2,"0")}</span><nav><a href={`/api/media/${image.id}`} target="_blank" rel="noreferrer">Открыть</a><form action={deleteGalleryPhoto}><input type="hidden" name="albumId" value={item.id}/><input type="hidden" name="mediaId" value={image.id}/><button type="submit">Удалить</button></form></nav></article>)}</div></details>}<h2>Редактирование</h2><form action={updateGalleryAlbum}><input type="hidden" name="id" value={item.id}/><label>Название альбома<input name="title" required defaultValue={item.title}/></label><label>Год<input name="year" type="number" min="2000" max="2100" required defaultValue={item.year}/></label><FileDropzone name="images" label="Добавить фотографии в альбом" multiple maxFiles={50}/><button type="submit">Сохранить изменения</button></form></main>;
}
