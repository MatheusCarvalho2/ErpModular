import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("inativar some da lista padrão; reativar volta", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const unique = `Status E2E ${Date.now()}`;

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(unique);
  await page.locator("#description").fill("Para inativar");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page.getByRole("cell", { name: unique })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(unique) })
    .getByRole("button", { name: "Inativar" })
    .click();
  await expect(page.getByRole("cell", { name: unique })).toHaveCount(0);

  await page.getByRole("link", { name: "Inativos", exact: true }).click();
  await expect(page.getByRole("cell", { name: unique })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(unique) })
    .getByRole("button", { name: "Reativar" })
    .click();

  await page.getByRole("link", { name: "Ativos", exact: true }).click();
  await expect(page.getByRole("cell", { name: unique })).toBeVisible();
});
