import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("rejeita nome vazio e duplicado case/acento", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/produtos/novo");

  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByText(/Informe o nome do produto/i)).toBeVisible();

  const stamp = Date.now();
  const name = `Café Prod ${stamp}`;
  await page.getByLabel(/Nome do produto/).fill(name);
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page).toHaveURL(/\/app\/produtos$/);

  await page.goto("/app/produtos/novo");
  await page.getByLabel(/Nome do produto/).fill(`cafe prod ${stamp}`);
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByText(/Já existe um produto ativo com este nome/i)).toBeVisible();
});
