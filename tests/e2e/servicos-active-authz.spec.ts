import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores com default vê ações de inativar", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/servicos");
  await expect(page.getByRole("button", { name: "Inativar" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Inativos", exact: true })).toBeVisible();
});

test("reativar com nome colidindo com ativo falha", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const name = `Conflito ${stamp}`;

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(name);
  await page.locator("#description").fill("A");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page.getByRole("cell", { name: name })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("button", { name: "Inativar" })
    .click();
  await expect(page.getByRole("cell", { name: name })).toHaveCount(0);

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(name);
  await page.locator("#description").fill("B ativo");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page.getByRole("cell", { name: name })).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toMatch(/reativar|nome|existe/i);
    await dialog.accept();
  });

  await page.getByRole("link", { name: "Inativos", exact: true }).click();
  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("button", { name: "Reativar" })
    .click();

  // still inactive after failed reactivate
  await expect(page.getByRole("cell", { name: name })).toBeVisible();
  await page.getByRole("link", { name: "Ativos", exact: true }).click();
  await expect(page.getByRole("cell", { name: name })).toHaveCount(1);
});
