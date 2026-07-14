import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("inativar cliente mantém busca por identificador", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const phone = `(11) 92222-${String(stamp).slice(-4)}`;
  const identifier = `KEEP-${stamp}`;

  await page.goto("/app/clientes/novo");
  await page.getByLabel(/Nome do cliente/).fill(`Inativar ${stamp}`);
  await page.getByLabel(/Telefone/).fill(phone);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);

  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(identifier);
  await page.getByRole("button", { name: "Vincular produto" }).click();
  await expect(page.getByRole("cell", { name: identifier })).toBeVisible();

  await page.getByRole("button", { name: "Inativar", exact: true }).click();
  await expect(page.getByText(/inativo/i)).toBeVisible();
  await page.goto("/app/clientes");
  await expect(page.getByRole("link", { name: `Inativar ${stamp}` })).toHaveCount(0);

  await page.getByLabel(/Buscar por identificador/).fill(identifier);
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText(new RegExp(`Encontrado: Inativar ${stamp}`))).toBeVisible();
});
