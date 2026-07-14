import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("telefone duplicado bloqueia e vínculo entre pessoas permite", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const phone = `(11) 94444-${String(stamp).slice(-4)}`;

  await page.goto("/app/clientes/novo");
  await page.getByLabel(/Nome do cliente/).fill(`Pessoa A ${stamp}`);
  await page.getByLabel(/Telefone/).fill(phone);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);

  await page.goto("/app/clientes/novo");
  await page.getByLabel(/Nome do cliente/).fill(`Pessoa B ${stamp}`);
  await page.getByLabel(/Telefone/).fill(phone);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page.getByRole("button", { name: /Vincular as duas pessoas/i })).toBeVisible();

  await page.getByRole("button", { name: /Vincular as duas pessoas/i }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);
  await expect(page.getByRole("heading", { name: `Pessoa B ${stamp}` })).toBeVisible();
});
