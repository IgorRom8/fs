import { AboutSection } from "@/src/widgets/about-section";
import { ContactSection } from "@/src/widgets/contact-section";
import { Footer } from "@/src/widgets/footer";
import { Header } from "@/src/widgets/header";
import { HeroSection } from "@/src/widgets/hero-section";
import { ProjectsSection } from "@/src/widgets/projects-section";
import { ServicesSection } from "@/src/widgets/services-section";
import { StandardsSection } from "@/src/widgets/standards-section";

export default function Home() {
  return <main><Header /><HeroSection /><AboutSection /><ServicesSection /><ProjectsSection /><StandardsSection /><ContactSection /><Footer /></main>;
}
