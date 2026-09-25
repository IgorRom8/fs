CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  logo_id uuid REFERENCES media(id) ON DELETE SET NULL,
  logo_path text,
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partners_publication_idx ON partners(published, position ASC);

INSERT INTO partners (slug, title, description, logo_path, position, published) VALUES
  ('versal', 'Версаль', 'Поставщик облицовочных фиброцементных и хризотилцементных плит для вентилируемых фасадов жилых, административных и социальных объектов.', '/partners/versal.png', 0, true),
  ('kontur', 'Группа компаний Контур', 'Производитель оцинкованных систем для вентилируемых фасадов с сильным инженерным блоком, собственным проектированием и изготовлением элементов подсистем.', '/partners/kontur.png', 1, true),
  ('gruppa-alternativa', 'Группа Альтернатива', 'Российская группа компаний комплексных решений для навесных вентилируемых фасадов: от проектирования до производства и поставки комплектующих.', '/partners/gruppa-alt.jpg', 2, true),
  ('zhelezny-fort', 'Железный Форт', 'Производитель кровельно-фасадных материалов и изделий из оцинкованной стали, выполняющий также резку, гибку и окраску металла.', '/partners/zhelezny-fort.jpg', 3, true),
  ('am-arkhimed', 'АМ АРХИМЕД', 'Московское архитектурное бюро, которое с 2001 года проектирует градостроительные комплексы, общественные здания и жилые дома.', '/partners/arkhimed.png', 4, true),
  ('promaliance', 'Промальянс', 'Современное высокотехнологичное производство широкого спектра изделий из металла для внешней и внутренней отделки зданий.', '/partners/promaliance.png', 5, true)
ON CONFLICT (slug) DO NOTHING;
