ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS facade_area numeric(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS floors text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sections text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'В процессе';
