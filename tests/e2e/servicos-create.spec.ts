import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin cria serviço válido e vê na listagem", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/servicos/novo");

  const unique = `Servico E2E ${Date.now()}`;
  await page.getByLabel(/Nome do serviço/).fill(unique);
  await page.locator("#description").fill("Descrição do serviço de teste");
  await page.getByLabel(/Valor cobrado/).fill("99,90");
  await page.getByLabel(/Tempo — horas/).fill("1");
  await page.getByLabel(/Tempo — minutos/).fill("30");
  await page.getByRole("button", { name: "Salvar serviço" }).click();

  await expect(page).toHaveURL(/\/app\/servicos$/);
  const row = page.getByRole("row", { name: new RegExp(unique) });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "1h 30min" })).toBeVisible();
});
