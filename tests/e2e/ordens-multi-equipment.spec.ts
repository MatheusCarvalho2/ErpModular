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

test("permite duas OS no mesmo equipamento", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const a = `multi-a-${Date.now()}`;
  const b = `multi-b-${Date.now()}`;
  await fillNewOrder(page, a);
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico$/);
  await fillNewOrder(page, b);
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico$/);
  await expect(page.getByRole("row", { name: /José Demo/i }).first()).toBeVisible();
});
