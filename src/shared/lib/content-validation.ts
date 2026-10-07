import { z } from "zod";

export const requiredText = z.string().trim().min(1);
export const optionalText = z.string().trim().transform((value) => value || null);
export const facadeArea = z.string().trim()
  .transform((value) => value ? value.replace(/\s/g, "").replace(",", ".") : null)
  .refine((value) => value === null || (!Number.isNaN(Number(value)) && Number(value) >= 0), "Укажите корректную площадь");

const transliteration: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

export function makeSlug(value: string) {
  const normalized = value.trim().toLowerCase().split("")
    .map((char) => transliteration[char] ?? char).join("")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 100).replace(/-+$/g, "");
  return normalized || `material-${Date.now()}`;
}
