import { describe, expect, it } from "vitest";
import { normalizeName } from "@/lib/service-name";

describe("service order status name rules", () => {
  it("normalizes names case/accent insensitive", () => {
    expect(normalizeName("Recebido")).toBe(normalizeName("recebido"));
    expect(normalizeName("Orçando")).toBe(normalizeName("orcando"));
  });

  it("treats default initial as requiring OPERATIONAL role", () => {
    const allowed = (role: string, isDefault: boolean) =>
      !isDefault || role === "OPERATIONAL";
    expect(allowed("OPERATIONAL", true)).toBe(true);
    expect(allowed("COMPLETED", true)).toBe(false);
    expect(allowed("CANCELLED", false)).toBe(true);
  });
});
