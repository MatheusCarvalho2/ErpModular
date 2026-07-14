import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("rejeita sem telefone e permite nomes iguais", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/clientes/novo");

  await page.getByLabel(/Nome do cliente/).fill("Só Nome");
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page.getByText(/Preencha nome e telefone/i)).toBeVisible();

  const stamp = Date.now();
  const sharedName = `Homônimo ${stamp}`;
  await page.getByLabel(/Nome do cliente/).fill(sharedName);
  await page.getByLabel(/Telefone/).fill(`(11) 96666-${String(stamp).slice(-4)}`);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);

  await page.goto("/app/clientes/novo");
  await page.getByLabel(/Nome do cliente/).fill(sharedName);
  await page
    .getByLabel(/Telefone/)
    .fill(`(11) 95555-${String(stamp).slice(-4)}`);
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page).toHaveURL(/\/app\/clientes\/.+/);
});
