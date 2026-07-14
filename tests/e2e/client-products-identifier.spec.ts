import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("rejeita identificador duplicado case/acento", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();

  await page.goto("/app/clientes");
  await page.getByRole("link", { name: "Maria Demo" }).click();

  const idBase = `Cafe-${stamp}`;
  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(idBase);
  await page.getByRole("button", { name: "Vincular produto" }).click();
  await expect(page.getByRole("cell", { name: idBase })).toBeVisible();

  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(`café-${stamp}`);
  await page.getByRole("button", { name: "Vincular produto" }).click();
  await expect(page.getByText(/Já existe um vínculo ativo com este identificador/i)).toBeVisible();
});
