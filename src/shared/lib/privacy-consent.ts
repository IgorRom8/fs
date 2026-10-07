export const CONSENT_STORAGE_KEY = "fs-cookie-consent";
export const CONSENT_CHANGE_EVENT = "fs-cookie-consent-change";
export const CONSENT_OPEN_EVENT = "fs-cookie-consent-open";
export const MAP_CONSENT_STORAGE_KEY = "fs-map-consent";
export const MAP_CONSENT_CHANGE_EVENT = "fs-map-consent-change";
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

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function readMapConsent() {
  return window.localStorage.getItem(MAP_CONSENT_STORAGE_KEY) === "allowed";
}

export function writeMapConsent(isAllowed: boolean) {
  if (isAllowed) window.localStorage.setItem(MAP_CONSENT_STORAGE_KEY, "allowed");
  else window.localStorage.removeItem(MAP_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(MAP_CONSENT_CHANGE_EVENT, { detail: isAllowed }));
}
