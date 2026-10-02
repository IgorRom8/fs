import { readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

import postgres from "postgres";
import sharp from "sharp";

const [projectSlug, ...photoPaths] = process.argv.slice(2);
// Upload to the same production database that the deployed application prefers.
const databaseUrl = process.env.DATABASE_URL_NEON ?? process.env.DATABASE_URL;

if (!projectSlug || photoPaths.length === 0) {
  throw new Error(
    "Usage: node --env-file=.env.local scripts/add-project-photos.mjs <project-slug> <photo...>",
  );
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DATABASE_URL_NEON is required");
}

function normalizeFilename(filePath) {
  const filename = basename(filePath);
  const extension = extname(filename).toLowerCase();
  const stem = filename.slice(0, -extname(filename).length).replace(/\s+\(\d+\)$/u, "");

  return `${stem}${extension}`;
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  const [project] = await sql`
    select id, title
    from projects
    where slug = ${projectSlug}
    limit 1
  `;

  if (!project) {
    throw new Error(`Project not found: ${projectSlug}`);
  }

  const linkedMedia = await sql`
    select m.filename
    from project_media pm
    join media m on m.id = pm.media_id
    where pm.project_id = ${project.id}
  `;
  const existingFilenames = new Set(
    linkedMedia.map(({ filename }) => normalizeFilename(filename).toLowerCase()),
  );
  const [{ next_position: nextPosition }] = await sql`
    select coalesce(max(position), -1) + 1 as next_position
    from project_media
    where project_id = ${project.id}
  `;

  let position = Number(nextPosition);
  let added = 0;
  let skipped = 0;

  for (const photoPath of photoPaths) {
    const filename = normalizeFilename(photoPath);
    const dedupeKey = filename.toLowerCase();

    if (existingFilenames.has(dedupeKey)) {
      console.log(`Skipped duplicate: ${filename}`);
      skipped += 1;
      continue;
    }

    const source = await readFile(resolve(photoPath));
    const { data, info } = await sharp(source)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });

    await sql.begin(async (transaction) => {
      const [media] = await transaction`
        insert into media (filename, mime_type, bytes, size, width, height, alt)
        values (
          ${filename},
          ${"image/webp"},
          ${data},
          ${data.length},
          ${info.width},
          ${info.height},
          ${`${project.title} — ход строительства`}
        )
        returning id
      `;

      await transaction`
        insert into project_media (project_id, media_id, position)
        values (${project.id}, ${media.id}, ${position})
      `;
    });

    existingFilenames.add(dedupeKey);
    console.log(`Added ${filename} at position ${position}`);
    position += 1;
    added += 1;
  }

  console.log(`Done: ${project.title}; added=${added}; skipped=${skipped}`);
} finally {
  await sql.end();
}
