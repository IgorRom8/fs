const fallbackSiteUrl = "http://localhost:3000";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallbackSiteUrl,
);

export const siteName = "Фасадная симфония";
export const siteDescription =
  "Проектирование, производство и монтаж навесных фасадов под ключ в Москве и Московской области.";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
