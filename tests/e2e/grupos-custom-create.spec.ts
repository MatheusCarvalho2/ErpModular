import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("cria grupo personalizado e edita permissões", async ({ page }) => {
  const name = `Grupo ${Date.now()}`;
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao/novo");
  await page.getByLabel(/Nome do grupo/).fill(name);
  await page.locator('[data-permission="services:create"]').uncheck();
  await page.locator('[data-permission="services:update"]').uncheck();
  await page.locator('[data-permission="services:setActive"]').uncheck();
  await page.getByRole("button", { name: "Criar grupo" }).click();
  await expect(page).toHaveURL(/\/app\/grupos-permissao$/);
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.locator('[data-permission="services:create"]').check();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator('[data-permission="services:create"]')).toBeChecked();
});
