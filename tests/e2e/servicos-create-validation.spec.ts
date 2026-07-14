import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("rejeita obrigatórios vazios", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/servicos/novo");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page.locator("p[role='alert']")).toContainText(/obrigat/i);
});

test("rejeita nome duplicado case/acento-insensitive", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const nameA = `Café Dup ${stamp}`;
  const nameB = `cafe dup ${stamp}`;

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(nameA);
  await page.locator("#description").fill("Primeiro");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page).toHaveURL(/\/app\/servicos$/);

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(nameB);
  await page.locator("#description").fill("Segundo");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page.locator("p[role='alert']")).toContainText(/já existe/i);
});
