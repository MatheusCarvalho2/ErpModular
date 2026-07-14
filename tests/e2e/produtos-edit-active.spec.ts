import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("editar e inativar/reativar produto", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const name = `Prod Edit ${stamp}`;

  await page.goto("/app/produtos/novo");
  await page.getByLabel(/Nome do produto/).fill(name);
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByRole("cell", { name })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.getByLabel(/Nome do produto/).fill(`${name} X`);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("cell", { name: `${name} X` })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(`${name} X`) })
    .getByRole("button", { name: "Inativar" })
    .click();
  await expect(page.getByRole("cell", { name: `${name} X` })).toHaveCount(0);

  await page.getByRole("link", { name: "Inativos", exact: true }).click();
  await page
    .getByRole("row", { name: new RegExp(`${name} X`) })
    .getByRole("button", { name: "Reativar" })
    .click();
  await page.getByRole("link", { name: "Ativos", exact: true }).click();
  await expect(page.getByRole("cell", { name: `${name} X` })).toBeVisible();
});
