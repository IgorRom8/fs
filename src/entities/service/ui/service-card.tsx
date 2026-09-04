import type { Service } from "../model/services";
import { Arrow } from "@/src/shared/ui/arrow";
export function ServiceCard({ service }: { service: Service }) { return <article className="service-card" data-reveal><span className="service-n">{service.number}</span><h3>{service.title}</h3><p>{service.description}</p><span className="service-arrow"><Arrow /></span></article>; }
