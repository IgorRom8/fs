import { AboutSection } from "@/src/widgets/about-section";
import { ContactSection } from "@/src/widgets/contact-section";
import { Footer } from "@/src/widgets/footer";
import { Header } from "@/src/widgets/header";
import { HeroSection } from "@/src/widgets/hero-section";
import { ProjectsSection } from "@/src/widgets/projects-section";
import { ServicesSection } from "@/src/widgets/services-section";
import { StandardsSection } from "@/src/widgets/standards-section";
import { getPublishedProjects } from "@/src/entities/project/api/projects-repository";
import { getAccumulatedFacadeVolume } from "@/src/shared/lib/production-volume";

export const revalidate = 3600;
export default async function Home() {
  const projects = await getPublishedProjects();
  const accumulatedVolume = getAccumulatedFacadeVolume();
  const daysOnMarket = Math.max(0, Math.floor((Date.now() - Date.UTC(2025, 9, 30)) / 86_400_000));
  return <main className="site-page"><Header /><HeroSection /><AboutSection daysOnMarket={daysOnMarket} accumulatedVolume={accumulatedVolume}/><ServicesSection /><ProjectsSection projects={projects}/><StandardsSection /><ContactSection /><Footer /></main>;
}
