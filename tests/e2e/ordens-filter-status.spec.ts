import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("filtrar lista por status e limpar filtro", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico");
  await page.getByRole("link", { name: /^Recebido$/i }).click();
  await expect(page).toHaveURL(/statusId=/);
  await page.getByRole("link", { name: /Limpar filtro/i }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico$/);
  await expect(page.getByRole("link", { name: /Todos os status/i })).toBeVisible();
});
