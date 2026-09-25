import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, hasDatabase } from "@/src/shared/lib/db";
import { partnersTable } from "@/src/shared/lib/db/schema";

export const initialPartners = [
  { id: "versal", slug: "versal", title: "Версаль", description: "Поставщик облицовочных фиброцементных и хризотилцементных плит для вентилируемых фасадов жилых, административных и социальных объектов.", logo: "/partners/versal.png", position: 0 },
  { id: "kontur", slug: "kontur", title: "Группа компаний Контур", description: "Производитель оцинкованных систем для вентилируемых фасадов с сильным инженерным блоком, собственным проектированием и изготовлением элементов подсистем.", logo: "/partners/kontur.png", position: 1 },
  { id: "gruppa-alternativa", slug: "gruppa-alternativa", title: "Группа Альтернатива", description: "Российская группа компаний комплексных решений для навесных вентилируемых фасадов: от проектирования до производства и поставки комплектующих.", logo: "/partners/gruppa-alt.jpg", position: 2 },
  { id: "zhelezny-fort", slug: "zhelezny-fort", title: "Железный Форт", description: "Производитель кровельно-фасадных материалов и изделий из оцинкованной стали, выполняющий также резку, гибку и окраску металла.", logo: "/partners/zhelezny-fort.jpg", position: 3 },
  { id: "am-arkhimed", slug: "am-arkhimed", title: "АМ АРХИМЕД", description: "Московское архитектурное бюро, которое с 2001 года проектирует градостроительные комплексы, общественные здания и жилые дома.", logo: "/partners/arkhimed.png", position: 4 },
  { id: "promaliance", slug: "promaliance", title: "Промальянс", description: "Современное высокотехнологичное производство широкого спектра изделий из металла для внешней и внутренней отделки зданий.", logo: "/partners/promaliance.png", position: 5 },
];

export async function getPublishedPartners() {
  if (!hasDatabase()) return initialPartners;
  try {
    const rows = await db().select().from(partnersTable).where(eq(partnersTable.published, true)).orderBy(asc(partnersTable.position), asc(partnersTable.createdAt));
    return rows.map((partner) => ({ ...partner, logo: partner.logoId ? `/api/media/${partner.logoId}` : partner.logoPath ?? "/partners/versal.png" }));
  } catch {
    return initialPartners;
  }
}
