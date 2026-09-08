import { services } from "@/src/entities/service/model/services";
import { ServiceCard } from "@/src/entities/service/ui/service-card";
import { SectionLabel } from "@/src/shared/ui/section-label";
export function ServicesSection() { return <section className="services section" id="services"><SectionLabel index="02" light>Экспертиза</SectionLabel><div className="services-head" data-reveal><h2>Создаем фасады,<br />формируем <em>архитектуру</em></h2><p>Пять направлений. Один стандарт исполнения.</p></div><div className="service-list">{services.map((service) => <ServiceCard key={service.number} service={service} />)}</div></section>; }
