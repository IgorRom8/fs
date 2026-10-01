"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, ConsentChoice, readConsent, writeConsent } from "@/src/shared/lib/privacy-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => setIsVisible(readConsent() === null);
    syncVisibility();
    window.addEventListener(CONSENT_CHANGE_EVENT, syncVisibility);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, syncVisibility);
  }, []);

  function saveChoice(choice: ConsentChoice) {
    writeConsent(choice);
  }

  if (!isVisible) return null;

  return (
    <aside className="cookie-consent" role="dialog" aria-label="Настройки файлов cookie" aria-live="polite">
      <div>
        <strong>Мы используем файлы cookie</strong>
        <p>
          Они нужны для корректной и безопасной работы сайта. Необязательные cookie используются только с вашего согласия. Подробнее — в <Link href="/privacy">политике обработки персональных данных</Link>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-secondary" onClick={() => saveChoice("essential")}>Только необходимые</button>
        <button type="button" className="cookie-primary" onClick={() => saveChoice("accepted")}>Принять</button>
      </div>
    </aside>
  );
}
