export const CONSENT_STORAGE_KEY = "fs-cookie-consent";
export const CONSENT_CHANGE_EVENT = "fs-cookie-consent-change";
export type ConsentChoice = "accepted" | "essential";

export function readConsent(): ConsentChoice | null {
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "essential" ? value : null;
}

export function writeConsent(choice: ConsentChoice | null) {
  if (choice === null) window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  else window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}
