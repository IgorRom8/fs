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

export const dynamic = "force-dynamic";

function getMoscowCalendarDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

export default async function Home() {
  const projects = await getPublishedProjects();
  const accumulatedVolume = getAccumulatedFacadeVolume();
  const daysOnMarket = Math.max(0, Math.floor((getMoscowCalendarDate() - Date.UTC(2025, 9, 30)) / 86_400_000));
  return <main className="site-page"><Header /><HeroSection /><AboutSection daysOnMarket={daysOnMarket} accumulatedVolume={accumulatedVolume}/><ServicesSection /><ProjectsSection projects={projects}/><StandardsSection /><ContactSection /><Footer /></main>;
}
