import { describe, expect, it } from "vitest";
import { slugifyCompanyName, uniqueSlug } from "@/lib/platform/slug";

describe("slugifyCompanyName", () => {
  it("normalizes accents and spaces", () => {
    expect(slugifyCompanyName("  Café São José  ")).toBe("cafe-sao-jose");
  });

  it("falls back when empty", () => {
    expect(slugifyCompanyName("!!!")).toBe("empresa");
  });
});

describe("uniqueSlug", () => {
  it("returns base when free", () => {
    expect(uniqueSlug("demo", new Set(["outra"]))).toBe("demo");
  });

  it("appends suffix when taken", () => {
    expect(uniqueSlug("demo", new Set(["demo", "demo-2"]))).toBe("demo-3");
  });
});
