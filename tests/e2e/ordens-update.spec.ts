import { test, expect, type Page } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

async function fillNewOrder(page: Page, description: string) {
  await page.goto("/app/ordens-servico/novo");
  await expect(page.getByRole("button", { name: "Salvar ordem" })).toBeVisible();
  await page.locator('select[aria-label="Serviço"]').selectOption({ label: "Reparo de eletrodoméstico" });
  await page.locator('select[aria-label="Cliente"]').selectOption({ label: "José Demo" });
  await expect(page.locator('select[aria-label="Equipamento"] option')).toHaveCount(2, {
    timeout: 10_000,
  });
  await page.locator('select[aria-label="Equipamento"]').selectOption({ index: 1 });
  await page.locator('textarea[aria-label="Descrição do serviço prestado"]').fill(description);
}

test("admin atualiza status e valor de OS operacional", async ({ page }) => {
  const tag = `upd-${Date.now()}`;
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await fillNewOrder(page, tag);
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico$/);

  await page.getByRole("link", { name: /José Demo/i }).first().click();
  await page.locator('select[aria-label="Status"]').selectOption({ label: "Fazendo" });
  await page.locator('input[aria-label="Valor cobrado (R$)"]').fill("199,90");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.goto("/app/ordens-servico");
  await expect(page.getByRole("row", { name: /Fazendo/i }).first()).toBeVisible();
});
