"use client";

import { writeConsent } from "@/src/shared/lib/privacy-consent";

export function CookieSettingsButton() {
  return <button className="footer-cookie-settings" type="button" onClick={() => writeConsent(null)}>Настройки cookie</button>;
}
