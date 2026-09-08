import Link from "next/link";
import { createGalleryAlbum } from "../../actions";
import { requireAdmin } from "@/src/shared/lib/admin";
import { FileDropzone } from "@/src/shared/ui/file-dropzone";

export default async function NewGalleryAlbum() {
  await requireAdmin();
  return <main className="admin-editor"><Link href="/admin">← Назад</Link><h1>Новый фотоальбом</h1><form action={createGalleryAlbum}><label>Название альбома<input name="title" required placeholder="Например: Объекты 2026"/></label><label>Год<input name="year" type="number" min="2000" max="2100" defaultValue={new Date().getFullYear()} required/></label><FileDropzone name="images" label="Фотографии для галереи" multiple maxFiles={50} required/><label className="admin-check"><input name="published" type="checkbox"/>Опубликовать сразу</label><button type="submit">Сохранить альбом</button></form></main>;
}
