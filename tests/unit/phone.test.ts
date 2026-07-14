import { describe, expect, it } from "vitest";
import { normalizePhoneDigits } from "@/lib/phone";

describe("normalizePhoneDigits", () => {
  it("keeps only digits", () => {
    expect(normalizePhoneDigits("(11) 98888-7777")).toBe("11988887777");
    expect(normalizePhoneDigits("11 9 8888 7777")).toBe("11988887777");
  });

  it("returns empty when no digits", () => {
    expect(normalizePhoneDigits("abc")).toBe("");
    expect(normalizePhoneDigits("   ")).toBe("");
  });
});
