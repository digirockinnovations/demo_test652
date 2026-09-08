/**
 * Money is integer cents everywhere.
 *
 * Floats and currency do not mix — 0.1 + 0.2 is famously not 0.3, and the
 * failure shows up as a receipt that is a cent out, which is the kind of bug
 * customers notice and nobody can reproduce.
 */

/** Rounds half away from zero, which is what invoicing expects. */
export function applyPercent(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100);
}

export function sumCents(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

/** "$12.34". Assumes AUD; the demo has no multi-currency story. */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Parses "12.34" or "$12.34" into cents. Returns null for anything else. */
export function parseAmount(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}
