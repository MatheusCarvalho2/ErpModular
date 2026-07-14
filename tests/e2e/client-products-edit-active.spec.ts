import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("inativar vínculo libera identificador", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  const stamp = Date.now();
  const identifier = `FREE-${stamp}`;

  await page.goto("/app/clientes");
  await page.getByRole("link", { name: "Maria Demo" }).click();
  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(identifier);
  await page.getByRole("button", { name: "Vincular produto" }).click();
  await expect(page.getByRole("cell", { name: identifier })).toBeVisible();

  await page
    .getByRole("row", { name: new RegExp(identifier) })
    .getByRole("button", { name: "Inativar vínculo" })
    .click();
  await expect(page.getByRole("cell", { name: identifier })).toHaveCount(0);

  await page.getByLabel(/Produto/).selectOption({ label: "Air fryer" });
  await page.getByLabel(/Identificador/).fill(identifier);
  await page.getByRole("button", { name: "Vincular produto" }).click();
  await expect(page.getByRole("cell", { name: identifier })).toBeVisible();
});
