import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, hasDatabase } from "@/src/shared/lib/db";
import { galleryAlbums, galleryMedia, media } from "@/src/shared/lib/db/schema";

export async function getPublishedGalleryAlbums() {
  if (!hasDatabase()) return [];
  const albums = await db().select().from(galleryAlbums).where(eq(galleryAlbums.published, true)).orderBy(desc(galleryAlbums.year), desc(galleryAlbums.createdAt));
  return Promise.all(albums.map(async album => {
    const images = await db().select({ id: media.id, alt: media.alt }).from(galleryMedia).innerJoin(media, eq(galleryMedia.mediaId, media.id)).where(eq(galleryMedia.albumId, album.id)).orderBy(asc(galleryMedia.position));
    return { ...album, images: images.map(image => ({ src: `/api/media/${image.id}`, alt: image.alt })) };
  }));
}
