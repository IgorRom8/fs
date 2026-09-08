import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, hasDatabase } from "@/src/shared/lib/db";
import { newsItems } from "@/src/shared/lib/db/schema";
const formatDate=(value:Date)=>new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(value);
export async function getPublishedNews(){if(!hasDatabase())return [];const rows=await db().select().from(newsItems).where(eq(newsItems.published,true)).orderBy(desc(newsItems.publishedAt));return rows.map(row=>({slug:row.slug,title:row.title,date:formatDate(row.publishedAt??row.createdAt),image:row.coverId?`/api/media/${row.coverId}`:"/news/skygarden.webp",excerpt:row.excerpt,content:row.content}));}
export async function getPublishedNewsItem(slug:string){if(!hasDatabase())return undefined;const [row]=await db().select().from(newsItems).where(eq(newsItems.slug,slug)).limit(1);if(!row?.published)return undefined;return {slug:row.slug,title:row.title,date:formatDate(row.publishedAt??row.createdAt),image:row.coverId?`/api/media/${row.coverId}`:"/news/skygarden.webp",excerpt:row.excerpt,content:row.content};}
