import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin cria produto válido e vê na listagem", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/produtos/novo");

  const unique = `Produto E2E ${Date.now()}`;
  await page.getByLabel(/Nome do produto/).fill(unique);
  await page.getByLabel(/^Descrição/).fill("Descrição do produto");
  await page.getByRole("button", { name: "Salvar produto" }).click();

  await expect(page).toHaveURL(/\/app\/produtos$/);
  await expect(page.getByRole("row", { name: new RegExp(unique) })).toBeVisible();
});
