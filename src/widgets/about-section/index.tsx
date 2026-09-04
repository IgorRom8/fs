"use client";
import { useScrollReveal } from "@/src/shared/lib/use-scroll-reveal";
import { Arrow } from "@/src/shared/ui/arrow";
import { SectionLabel } from "@/src/shared/ui/section-label";
const stats = [["313", "дней на рынке"], ["31 000", "м² фасадов"], ["100%", "собственный штат"], ["5", "лет гарантии"]];
export function AboutSection() { useScrollReveal(); return <section className="intro section" id="about"><SectionLabel index="01">О компании</SectionLabel><div className="intro-copy" data-reveal><h2>Забираем на себя весь фасад —<br /><em>и ваше спокойствие</em></h2><div className="intro-text"><p>Мы не просто подрядчик, а сплочённая команда инженеров и монтажников. Берём ограниченное число объектов, чтобы вложить максимум внимания в каждый.</p><a className="text-link" href="#services">Узнать больше <Arrow /></a></div></div><div className="stats" data-reveal>{stats.map(([value, label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div></section>; }
