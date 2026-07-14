import { test, expect, type Page } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

async function fillNewOrder(page: Page, description: string) {
  await page.goto("/app/ordens-servico/novo");
  await expect(page.getByRole("button", { name: "Salvar ordem" })).toBeVisible();
  await page.locator('select[aria-label="Serviço"]').selectOption({ label: "Reparo de eletrodoméstico" });
  await expect(page.locator('input[aria-label="Valor cobrado (R$)"]')).not.toHaveValue("");
  await page.locator('select[aria-label="Cliente"]').selectOption({ label: "José Demo" });
  await expect(page.locator('select[aria-label="Equipamento"] option')).toHaveCount(2, {
    timeout: 10_000,
  });
  await page.locator('select[aria-label="Equipamento"]').selectOption({ index: 1 });
  await page.locator('textarea[aria-label="Descrição do serviço prestado"]').fill(description);
}

test("admin cria OS com valor pré-preenchido e vê na listagem", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const desc = `OS E2E ${Date.now()}`;
  await fillNewOrder(page, desc);
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico$/);
  await expect(page.getByRole("row", { name: /José Demo/i }).first()).toBeVisible();
});
