import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import postgres from "postgres";
import sharp from "sharp";

const news = [
  { slug: "skygarden-substation", title: "Расширяем зону ответственности на ЖК Skygarden", publishedAt: "2026-08-28T09:00:00+03:00", image: "public/news/skygarden.webp", excerpt: "Приступаем к облицовке электрической подстанции в квартале Skygarden.", content: ["Наше сотрудничество с генподрядчиком на объекте ЖК Skygarden выходит на новый этап. Помимо работ на третьем корпусе, команда «Фасадной Симфонии» выиграла тендер на фасадные работы для инфраструктурного объекта — электрической подстанции.", "Наша цель — бережно интегрировать техническое здание в премиальную архитектурную концепцию квартала."] },
  { slug: "moscow-renovation", title: "Программа реновации Москвы — монтаж идёт по графику", publishedAt: "2026-08-21T09:00:00+03:00", image: "public/news/renovation.webp", excerpt: "Продолжаем облицовку фасадов металлическими кассетами на улице Судакова.", content: ["Городские проекты требуют особой дисциплины. На объекте по адресу улица Судакова наши специалисты продолжают облицовку фасадов металлическими кассетами из оцинкованной стали.", "Все высотные работы ведутся собственным штатом инженеров и монтажников с неукоснительным соблюдением стандартов безопасности."] },
  { slug: "in-house-team", title: "Собственный штат как стандарт качества", publishedAt: "2026-08-14T09:00:00+03:00", image: "public/news/team.webp", excerpt: "Почему принцип «сто процентов свои люди» стал фундаментом компании.", content: ["Надёжность подрядчика проверяется на лесах. Постоянный, слаженный коллектив позволяет нам исключить срывы сроков и сохранять единый стандарт исполнения.", "Именно поэтому мы можем давать честную гарантию до пяти лет на государственные объекты и отвечать за каждый этап работ."] },
];

const projects = [
  { slug: "sudakova-renovation", title: "Улица Судакова", category: "Городской проект", location: "Москва", developer: "Фонд реновации", facadeArea: "21026.50", floors: "13-14-22", sections: "7 (14/14/14/14/13/22/22)", status: "В процессе", description: "Монтаж навесного фасада с облицовкой металлическими кассетами из оцинкованной стали.", createdAt: "2026-08-01T09:00:00+03:00", images: Array.from({length:15},(_,index)=>`public/portfolio/sudakova-2026/sudakova-new-${String(index+1).padStart(2,"0")}.webp`) },
  { slug: "skygarden-building-3", title: "ЖК Скай Гарден", category: "Жилой комплекс", location: "Москва", developer: "ГК ФСК", facadeArea: "10348.25", floors: "23-27-29-30-44", sections: "5 (29/44/27/30/23)", status: "В процессе", description: "Монтаж навесного фасада с облицовкой хризотилцементными плитами.", createdAt: "2026-07-01T09:00:00+03:00", images: ["public/portfolio/skygarden-1.webp", "public/portfolio/skygarden-2.webp", "public/portfolio/skygarden-3.webp", "public/portfolio/skygarden-4.webp"] },
  { slug: "skygarden-substation", title: "Электрическая подстанция — ЖК Skygarden", category: "Инфраструктура", location: "Москва", description: "Фасад инфраструктурного объекта, бережно интегрированный в архитектурную концепцию премиального квартала Skygarden.", createdAt: "2026-06-01T09:00:00+03:00", images: ["public/portfolio/substation-1.webp", "public/portfolio/substation-2.webp"] },
];

async function imageData(path, alt) {
  const bytes = await readFile(resolve(path));
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Не удалось определить размер ${path}`);
  return { bytes, filename: basename(path), mimeType: "image/webp", size: bytes.length, width: metadata.width, height: metadata.height, alt };
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL не настроен");
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
let importedNews = 0;
let importedProjects = 0;
try {
  for (const item of news) {
    const exists = await sql`select id from news where slug = ${item.slug} limit 1`;
    if (exists.length) continue;
    const image = await imageData(item.image, item.title);
    await sql.begin(async (tx) => {
      const [savedImage] = await tx`insert into media (filename, mime_type, bytes, size, width, height, alt) values (${image.filename}, ${image.mimeType}, ${image.bytes}, ${image.size}, ${image.width}, ${image.height}, ${image.alt}) returning id`;
      await tx`insert into news (slug, title, excerpt, content, cover_id, published, published_at, created_at, updated_at) values (${item.slug}, ${item.title}, ${item.excerpt}, ${tx.json(item.content)}, ${savedImage.id}, true, ${new Date(item.publishedAt)}, ${new Date(item.publishedAt)}, ${new Date(item.publishedAt)})`;
    });
    importedNews++;
  }
  for (const item of projects) {
    const exists = await sql`select id from projects where slug = ${item.slug} limit 1`;
    if (exists.length) continue;
    await sql.begin(async (tx) => {
      const [project] = await tx`insert into projects (slug, title, category, location, description, developer, facade_area, floors, sections, status, published, created_at, updated_at) values (${item.slug}, ${item.title}, ${item.category}, ${item.location}, ${item.description}, ${item.developer??null}, ${item.facadeArea??null}, ${item.floors??null}, ${item.sections??null}, ${item.status??"В процессе"}, true, ${new Date(item.createdAt)}, ${new Date(item.createdAt)}) returning id`;
      for (const [position, path] of item.images.entries()) {
        const image = await imageData(path, item.title);
        const [savedImage] = await tx`insert into media (filename, mime_type, bytes, size, width, height, alt) values (${image.filename}, ${image.mimeType}, ${image.bytes}, ${image.size}, ${image.width}, ${image.height}, ${image.alt}) returning id`;
        await tx`insert into project_media (project_id, media_id, position) values (${project.id}, ${savedImage.id}, ${position})`;
      }
    });
    importedProjects++;
  }
  console.log(`Импорт завершён: новостей — ${importedNews}, объектов — ${importedProjects}.`);
} finally {
  await sql.end();
}
