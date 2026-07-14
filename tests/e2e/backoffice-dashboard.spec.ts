import { expect, test } from "@playwright/test";
import { loginPlatformAs } from "./helpers";

test("dashboard shows company and client user totals", async ({ page }) => {
  await loginPlatformAs(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Empresas (total)")).toBeVisible();
  await expect(page.getByText("Usuários clientes (total)")).toBeVisible();
  await expect(page.getByText("Usuários por empresa")).toBeVisible();
  await expect(page.getByText("Empresa Demo")).toBeVisible();
});
