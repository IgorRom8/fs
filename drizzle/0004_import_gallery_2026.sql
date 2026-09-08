WITH created_album AS (
  INSERT INTO gallery_albums (title, year, published)
  SELECT 'Объекты 2026', 2026, true
  WHERE EXISTS (SELECT 1 FROM project_media)
    AND NOT EXISTS (SELECT 1 FROM gallery_albums WHERE year = 2026)
  RETURNING id
), target_album AS (
  SELECT id FROM created_album
  UNION ALL
  SELECT id FROM gallery_albums WHERE year = 2026 ORDER BY id LIMIT 1
)
INSERT INTO gallery_media (album_id, media_id, position)
SELECT
  (SELECT id FROM target_album LIMIT 1),
  source.media_id,
  source.position
FROM (
  SELECT DISTINCT ON (pm.media_id)
    pm.media_id,
    row_number() OVER (ORDER BY p.created_at, pm.position, pm.media_id)::integer - 1 AS position
  FROM project_media pm
  JOIN projects p ON p.id = pm.project_id
  ORDER BY pm.media_id, p.created_at, pm.position
) source
WHERE NOT EXISTS (
  SELECT 1 FROM gallery_media gm
  WHERE gm.album_id = (SELECT id FROM target_album LIMIT 1)
    AND gm.media_id = source.media_id
);
