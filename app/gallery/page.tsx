import type { Metadata } from "next";
import { getPublishedGalleryAlbums } from "@/src/entities/gallery";
import { getPublishedProjects } from "@/src/entities/project";
import { GalleryArchive } from "@/src/features/gallery-archive";
import { PageHero } from "@/src/shared/ui/page-hero";
import { PageShell } from "@/src/widgets/page-shell";
export const metadata:Metadata={title:"Фотогалерея",description:"Фотографии фасадов, строительных площадок и рабочих процессов компании «Фасадная симфония».",alternates:{canonical:"/gallery"}};
export const dynamic = "force-dynamic";
export default async function GalleryPage(){let albums=await getPublishedGalleryAlbums();if(!albums.length){const images=(await getPublishedProjects()).flatMap(project=>project.gallery.map(src=>({src,alt:project.title})));if(images.length)albums=[{id:"legacy-2026",title:"Объекты",year:2026,published:true,createdAt:new Date(),updatedAt:new Date(),images}]}return <PageShell><PageHero eyebrow="Галерея" title="Работа в деталях" image="/gallery-hero-v2.webp" description="Фасады, люди и процессы на наших объектах"/><GalleryArchive albums={albums}/></PageShell>}
