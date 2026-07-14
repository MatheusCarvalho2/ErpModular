import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin vê presets Admin e Operadores", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao");
  await expect(page.getByRole("heading", { name: "Grupos de permissão" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Admin", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Operadores", exact: true })).toBeVisible();
  await expect(page.getByText("Sistema").first()).toBeVisible();
});

test("Operadores nasce com permissões de Serviços ligadas", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: /Operadores/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await expect(page.getByTestId("permission-matrix")).toBeVisible();
  for (const key of [
    "services:list",
    "services:create",
    "services:update",
    "services:setActive",
    "products:list",
    "products:create",
    "clients:list",
    "clients:create",
    "clientProducts:list",
    "clientProducts:create",
  ]) {
    await expect(page.locator(`[data-permission="${key}"]`)).toBeChecked();
  }
});
