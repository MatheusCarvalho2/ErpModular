import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/normalize-text";

describe("normalizeText", () => {
  it("trims, lowercases, and strips accents", () => {
    expect(normalizeText("  Café-1 ")).toBe("cafe-1");
    expect(normalizeText("Air Fryer")).toBe("air fryer");
    expect(normalizeText("A1")).toBe("a1");
  });

  it("keeps leading zeros in identifiers", () => {
    expect(normalizeText("01")).toBe("01");
    expect(normalizeText("1")).toBe("1");
  });
});
