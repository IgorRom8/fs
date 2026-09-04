import type { Metadata } from "next";
import { projects } from "@/src/entities/project/model/projects";
import { GalleryArchive } from "@/src/features/gallery-archive/ui/gallery-archive";
import { PageHero } from "@/src/shared/ui/page-hero";
import { PageShell } from "@/src/widgets/page-shell";
export const metadata:Metadata={title:"Фотогалерея | Фасадная симфония"}; const images=projects.flatMap(project=>project.gallery);
export default function GalleryPage(){return <PageShell><PageHero eyebrow="Галерея" title="Работа в деталях" image="/gallery-hero.webp" description="Фасады, люди и процессы на наших объектах."/><GalleryArchive images={images}/></PageShell>}
