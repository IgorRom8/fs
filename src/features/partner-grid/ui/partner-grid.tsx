"use client";

import Image from "next/image";
import { useState } from "react";
import { removeSentencePeriods } from "@/src/shared/lib/text/remove-sentence-periods";
import styles from "./partner-grid.module.css";

type Partner = { id: string; title: string; description: string; logo: string };

export function PartnerGrid({ partners }: { partners: Partner[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  function toggleOnTouch(partnerId: string) {
    if (!window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    setActiveId((current) => current === partnerId ? null : partnerId);
  }

  return <section className={styles.grid} aria-label="Партнёры компании">
    {partners.map((partner, index) => <button
      className={`${styles.card}${activeId === partner.id ? ` ${styles.active}` : ""}`}
      type="button"
      key={partner.id}
      aria-label={`${partner.title}. Показать описание`}
      aria-pressed={activeId === partner.id}
      onClick={() => toggleOnTouch(partner.id)}
    >
      <span className={styles.inner}>
        <span className={styles.front}>
          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
          <Image src={partner.logo} alt={partner.title} fill sizes="(max-width: 700px) 100vw, 33vw" unoptimized={partner.logo.startsWith("/api/")} />
          <span className={styles.hint}>Подробнее</span>
        </span>
        <span className={styles.back}>
          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
          <strong>{partner.title}</strong>
          <span className={styles.description}>{removeSentencePeriods(partner.description)}</span>
        </span>
      </span>
    </button>)}
  </section>;
}
