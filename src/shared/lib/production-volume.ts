const FIRST_ACCOUNTING_YEAR = 2026;
const ANNUAL_VOLUME_SQUARE_METERS = 44_000;

function daysInUtcYear(year: number) {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/**
 * Accumulated facade volume: completed years are retained in full, while the
 * current year's 44,000 m² plan accrues once per calendar day.
 */
export function getAccumulatedFacadeVolume(now = new Date()) {
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now).filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
  const year = dateParts.year;
  if (year < FIRST_ACCOUNTING_YEAR) return 0;
  const completedYearsVolume = (year - FIRST_ACCOUNTING_YEAR) * ANNUAL_VOLUME_SQUARE_METERS;
  const currentDay = Math.floor((Date.UTC(year, dateParts.month - 1, dateParts.day) - Date.UTC(year, 0, 1)) / 86_400_000) + 1;
  const currentYearVolume = ANNUAL_VOLUME_SQUARE_METERS * currentDay / daysInUtcYear(year);
  return Math.floor(completedYearsVolume + currentYearVolume);
}
