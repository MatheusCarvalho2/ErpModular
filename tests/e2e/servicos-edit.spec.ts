import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin edita serviço e vê valor atualizado", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const unique = `Editar E2E ${Date.now()}`;

  await page.goto("/app/servicos/novo");
  await page.getByLabel(/Nome do serviço/).fill(unique);
  await page.locator("#description").fill("Antes");
  await page.getByRole("button", { name: "Salvar serviço" }).click();
  await expect(page).toHaveURL(/\/app\/servicos$/);

  await page
    .getByRole("row", { name: new RegExp(unique) })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.locator("#description").fill("Depois da edição");
  await page.getByLabel(/Valor cobrado/).fill("45,00");
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page).toHaveURL(/\/app\/servicos$/);
  await expect(page.getByRole("row", { name: new RegExp(unique) })).toContainText(
    "R$",
  );
});
