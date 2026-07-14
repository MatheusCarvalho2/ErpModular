import { normalizeText } from "@/lib/normalize-text";

/** @deprecated Prefer normalizeText — kept for existing imports */
export function normalizeName(name: string): string {
  return normalizeText(name);
}
