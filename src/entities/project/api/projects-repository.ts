import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, hasDatabase } from "@/src/shared/lib/db";
import { media, projectMedia, projectsTable } from "@/src/shared/lib/db/schema";
async function images(projectId:string){const rows=await db().select({id:media.id}).from(projectMedia).innerJoin(media,eq(projectMedia.mediaId,media.id)).where(eq(projectMedia.projectId,projectId)).orderBy(asc(projectMedia.position));return rows.map(row=>`/api/media/${row.id}`)}
export async function getPublishedProjects(){if(!hasDatabase())return [];const rows=await db().select().from(projectsTable).where(eq(projectsTable.published,true)).orderBy(desc(projectsTable.createdAt));return Promise.all(rows.map(async row=>{const gallery=await images(row.id);return {...row,cover:gallery[0]??"/portfolio/skygarden-1.webp",gallery}}));}
export async function getPublishedProject(slug:string){if(!hasDatabase())return undefined;const [row]=await db().select().from(projectsTable).where(eq(projectsTable.slug,slug)).limit(1);if(!row?.published)return undefined;const gallery=await images(row.id);return {...row,cover:gallery[0]??"/portfolio/skygarden-1.webp",gallery};}
