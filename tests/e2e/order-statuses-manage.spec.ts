import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin cria status e rejeita nome duplicado", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico/status");

  const unique = `Status E2E ${Date.now()}`;
  await page.getByLabel("Nome").fill(unique);
  await page.getByLabel("Ordem de exibição").fill("70");
  await page.getByLabel("Papel").selectOption({ label: "Cancelado" });
  await page.getByRole("button", { name: "Salvar status" }).click();
  await expect(page.getByRole("row", { name: new RegExp(unique) })).toBeVisible();

  await page.getByLabel("Nome").fill(unique);
  await page.getByLabel("Ordem de exibição").fill("71");
  await page.getByRole("button", { name: "Salvar status" }).click();
  await expect(page.getByText(/já existe um status ativo/i)).toBeVisible();
});
