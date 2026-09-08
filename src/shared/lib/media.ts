import "server-only";
import sharp from "sharp";
import { db } from "./db";
import { media } from "./db/schema";
export async function saveImage(file: File, alt: string) { if (!file.size) return null; if (file.size > 4_000_000) throw new Error("Файл должен быть меньше 4 МБ"); if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) throw new Error("Допустимы JPEG, PNG, WebP и AVIF"); const output = await sharp(Buffer.from(await file.arrayBuffer())).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true }); const [saved] = await db().insert(media).values({ filename: file.name, mimeType: "image/webp", bytes: output.data, size: output.data.length, width: output.info.width, height: output.info.height, alt }).returning({ id: media.id }); return saved.id; }
