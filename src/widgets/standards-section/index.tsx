import { standards } from "@/src/entities/standard/model/standards";
import { StandardCard } from "@/src/entities/standard/ui/standard-card";
import { SectionLabel } from "@/src/shared/ui/section-label";
export function StandardsSection() { return <section className="standards section"><SectionLabel index="04" light>Наш стандарт</SectionLabel><div className="standards-layout"><div className="sticky-title" data-reveal><p className="eyebrow"><span /> Основа партнёрства</p><h2>Спокойствие<br />заказчика —<br /><em>наш стандарт</em></h2></div><div className="standard-list">{standards.map((standard, index) => <StandardCard key={standard.title} standard={standard} index={index} />)}</div></div></section>; }
