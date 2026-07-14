import { describe, expect, it } from "vitest";
import { normalizeName } from "@/lib/service-name";

describe("normalizeName", () => {
  it("trims and lowercases", () => {
    expect(normalizeName("  Servico  ")).toBe("servico");
  });

  it("strips accents case-insensitively", () => {
    expect(normalizeName("Café")).toBe("cafe");
    expect(normalizeName("cafe")).toBe("cafe");
    expect(normalizeName("CAFÉ")).toBe("cafe");
  });

  it("treats Cafe and Café as equal", () => {
    expect(normalizeName("Cafe Premium")).toBe(normalizeName("Café Premium"));
  });
});
