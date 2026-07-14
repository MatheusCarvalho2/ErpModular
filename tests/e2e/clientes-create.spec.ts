import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin cria cliente com nome e telefone", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/clientes/novo");

  const stamp = Date.now();
  await page.getByLabel(/Nome do cliente/).fill(`Cliente E2E ${stamp}`);
  await page.getByLabel(/Telefone/).fill(`(11) 97777-${String(stamp).slice(-4)}`);
  await page.getByRole("button", { name: "Salvar cliente" }).click();

  await expect(page).toHaveURL(/\/app\/clientes\/.+/);
  await expect(page.getByRole("heading", { name: `Cliente E2E ${stamp}` })).toBeVisible();
});
