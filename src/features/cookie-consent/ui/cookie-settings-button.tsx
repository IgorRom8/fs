"use client";

import { openConsentSettings } from "@/src/shared/lib/privacy-consent";

export function CookieSettingsButton() {
  return <button className="footer-cookie-settings" type="button" onClick={openConsentSettings}>Настройки cookie</button>;
}
