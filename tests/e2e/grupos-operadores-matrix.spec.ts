import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("matriz de Operadores só lista permissões de negócio", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: /Operadores/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await expect(page.getByTestId("permission-matrix")).toBeVisible();
  await expect(page.getByText(/remover admin|gerir grupo admin/i)).toHaveCount(0);
  await expect(page.locator("[data-permission]")).toHaveCount(25);
});
