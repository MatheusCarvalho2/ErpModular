import { describe, expect, it } from "vitest";
import {
  businessPermissionKeys,
  filterBusinessKeys,
  isBusinessPermissionKey,
} from "@/lib/permissions/catalog";

describe("permissions catalog", () => {
  it("lists business CRUD keys for services, products, clients, links", () => {
    const keys = businessPermissionKeys();
    expect(keys).toContain("services:list");
    expect(keys).toContain("services:create");
    expect(keys).toContain("services:update");
    expect(keys).toContain("services:setActive");
    expect(keys).toContain("products:list");
    expect(keys).toContain("clients:create");
    expect(keys).toContain("clientProducts:setActive");
  });

  it("filters unknown keys", () => {
    expect(isBusinessPermissionKey("services:list")).toBe(true);
    expect(isBusinessPermissionKey("admin:delete")).toBe(false);
    expect(filterBusinessKeys(["services:list", "admin:x", "services:create"])).toEqual([
      "services:list",
      "services:create",
    ]);
  });
});
