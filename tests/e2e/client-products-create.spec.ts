import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("vincula produto com identificador no cliente", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();

  await page.goto("/app/clientes/novo");
  await page.getByLabel(/Nome do cliente/).fill(`Com Equip ${stamp}`);
  await page.getByLabel(/Telefone/).fill(`(11) 93333-${String(stamp).slice(-4)}`);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);

  const identifier = `E2E-${stamp}`;
  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(identifier);
  await page.getByLabel(/Número de série/).fill(`SN-${stamp}`);
  await page.getByLabel(/Observação/).fill("obs e2e");
  await page.getByRole("button", { name: "Vincular produto" }).click();

  await expect(page.getByRole("cell", { name: identifier })).toBeVisible();
  await expect(page.getByRole("cell", { name: `SN-${stamp}` })).toBeVisible();
});
