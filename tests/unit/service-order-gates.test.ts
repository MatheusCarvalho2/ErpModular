import { describe, expect, it } from "vitest";
import {
  canCorrectServiceOrderLinks,
  canEditServiceOrder,
} from "@/lib/service-orders/gates";

describe("service order gates", () => {
  it("permite editar ordens operacionais", () => {
    expect(canEditServiceOrder("OPERATIONAL", false, false)).toBe(true);
  });

  it("bloqueia operador em ordens fechadas", () => {
    expect(canEditServiceOrder("COMPLETED", false, false)).toBe(false);
    expect(canEditServiceOrder("CANCELLED", false, false)).toBe(false);
  });

  it("permite admin ou editClosed em ordens fechadas", () => {
    expect(canEditServiceOrder("COMPLETED", true, false)).toBe(true);
    expect(canEditServiceOrder("CANCELLED", false, true)).toBe(true);
  });

  it("exige correctLinks e editClosed quando necessário", () => {
    expect(canCorrectServiceOrderLinks("OPERATIONAL", false, false, false)).toBe(false);
    expect(canCorrectServiceOrderLinks("OPERATIONAL", false, true, false)).toBe(true);
    expect(canCorrectServiceOrderLinks("COMPLETED", false, true, false)).toBe(false);
    expect(canCorrectServiceOrderLinks("COMPLETED", false, true, true)).toBe(true);
  });
});
