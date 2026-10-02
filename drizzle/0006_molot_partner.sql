INSERT INTO partners (slug, title, description, logo_path, position, published)
VALUES (
  'molot',
  'MOLOT',
  'Российский производитель и поставщик профессионального строительного оборудования и крепёжных систем. Предлагает комплексные решения для монтажных работ: тарельчатые дюбели, газовые, пороховые и потолочные пистолеты, крепёжные системы, алмазную технику, расходные материалы и оснастку.',
  '/partners/molot.png',
  7,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  logo_path = EXCLUDED.logo_path,
  position = EXCLUDED.position,
  published = EXCLUDED.published;
