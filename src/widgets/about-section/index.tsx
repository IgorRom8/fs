"use client";
import { useEffect, useState } from "react";
import { useScrollReveal } from "@/src/shared/lib/use-scroll-reveal";
import { Arrow } from "@/src/shared/ui/arrow";
import { SectionLabel } from "@/src/shared/ui/section-label";

const DAY_MS = 86_400_000;
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;
const MARKET_START_UTC = Date.UTC(2025, 9, 30);

function getMoscowDaysOnMarket(now = Date.now()) {
  const moscowDay = Math.floor((now + MOSCOW_OFFSET_MS) / DAY_MS) * DAY_MS;
  return Math.max(0, Math.floor((moscowDay - MARKET_START_UTC) / DAY_MS));
}

export function AboutSection({ daysOnMarket, accumulatedVolume }: { daysOnMarket: number; accumulatedVolume: number }) {
  useScrollReveal();
  const [liveDaysOnMarket, setLiveDaysOnMarket] = useState(daysOnMarket);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const updateAtMoscowMidnight = () => {
      const now = Date.now();
      setLiveDaysOnMarket(getMoscowDaysOnMarket(now));
      const nextMidnight = (Math.floor((now + MOSCOW_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - MOSCOW_OFFSET_MS;
      timer = setTimeout(updateAtMoscowMidnight, Math.max(1_000, nextMidnight - now + 100));
    };

    updateAtMoscowMidnight();
    return () => clearTimeout(timer);
  }, []);

  const stats = [[new Intl.NumberFormat("ru-RU").format(liveDaysOnMarket), "дней на рынке"], [new Intl.NumberFormat("ru-RU").format(accumulatedVolume), "м² фасадов"], ["100%", "собственный штат"], ["5", "лет гарантии"]];
  return <section className="intro section" id="about"><SectionLabel index="01">О компании</SectionLabel><div className="intro-copy" data-reveal><h2><span>Забираем на себя весь фасад,</span><em>оберегая ваше спокойствие</em></h2><div className="intro-text"><p>Мы не просто подрядчик, а сплочённая команда инженеров и монтажников<br />Берём ограниченное число объектов, чтобы вложить максимум внимания в каждый</p><a className="text-link" href="#services">Узнать больше <Arrow /></a></div></div><div className="stats" data-reveal>{stats.map(([value, label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div></section>;
}
