"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "@/src/shared/ui/arrow";

export function ProjectBackButton() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 140);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <Link className={`project-back${compact ? " is-compact" : ""}`} href="/portfolio" aria-label="Назад к объектам">
      <Arrow />
      <span>Назад к объектам</span>
    </Link>
  );
}
