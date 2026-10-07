"use client";

import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, CONSENT_OPEN_EVENT, ConsentChoice, readConsent, writeConsent, writeMapConsent } from "@/src/shared/lib/privacy-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => setIsVisible(readConsent() === null);
    const openSettings = () => setIsVisible(true);
    syncVisibility();
    window.addEventListener(CONSENT_CHANGE_EVENT, syncVisibility);
    window.addEventListener(CONSENT_OPEN_EVENT, openSettings);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, syncVisibility);
      window.removeEventListener(CONSENT_OPEN_EVENT, openSettings);
    };
  }, []);

  function saveChoice(choice: ConsentChoice) {
    if (choice === "essential") writeMapConsent(false);
    writeConsent(choice);
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <aside className="cookie-consent" role="dialog" aria-label="Настройки файлов cookie" aria-live="polite">
      <div>
        <strong>Мы используем файлы cookie</strong>
        <p>
          Они нужны для корректной и безопасной работы сайта. Необязательные cookie используются только с вашего согласия.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-secondary" onClick={() => saveChoice("essential")}>Только необходимые</button>
        <button type="button" className="cookie-primary" onClick={() => saveChoice("accepted")}>Принять</button>
      </div>
    </aside>
  );
}
