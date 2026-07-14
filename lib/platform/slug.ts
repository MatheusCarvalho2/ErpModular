import { normalizeText } from "@/lib/normalize-text";

/** Base slug from company name (ascii, hyphenated). */
export function slugifyCompanyName(name: string): string {
  const base = normalizeText(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "empresa";
}

/** Append numeric suffix until candidate is not in `taken`. */
export function uniqueSlug(
  base: string,
  taken: ReadonlySet<string>,
): string {
  if (!taken.has(base)) {
    return base;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
