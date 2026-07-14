import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin de outra empresa não vê grupos da Demo", async ({ page }) => {
  await loginAs(page, CREDENTIALS.otherAdmin.email, CREDENTIALS.otherAdmin.password);
  await page.goto("/app/grupos-permissao");
  await expect(page.getByRole("cell", { name: "Admin", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Operadores", exact: true })).toBeVisible();
  // no Demo member names
  await page
    .getByRole("row", { name: /Operadores/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await expect(page.getByText("admin@demo.local")).toHaveCount(0);
  await expect(page.getByText("membro@demo.local")).toHaveCount(0);
  await expect(page.getByText("admin@outra.local")).toBeVisible();
});
