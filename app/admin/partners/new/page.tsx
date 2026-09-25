import Link from "next/link";
import { createPartner } from "../../actions";
import { requireAdmin } from "@/src/shared/lib/admin";
import { FileDropzone } from "@/src/shared/ui/file-dropzone";

export default async function NewPartner() {
  await requireAdmin();
  return <main className="admin-editor"><Link href="/admin">← Назад</Link><h1>Новый партнёр</h1><form action={createPartner}><label>Название<input name="title" required /></label><label>Адрес записи <small>Необязательно — сформируется из названия</small><input name="slug" maxLength={100} /></label><label>Краткое описание<textarea name="description" required rows={6} /></label><label>Порядок отображения <small>Чем меньше число, тем раньше карточка появится на сайте</small><input name="position" type="number" min="0" max="999" defaultValue="0" required /></label><FileDropzone name="logo" label="Изображение партнёра — только один файл" maxFiles={1} required /><label className="admin-check"><input name="published" type="checkbox" />Опубликовать сразу</label><button type="submit">Сохранить партнёра</button></form></main>;
}
