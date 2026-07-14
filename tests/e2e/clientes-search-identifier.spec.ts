import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("busca por identificador localiza cliente", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/clientes");
  await page.getByLabel(/Buscar por identificador/).fill("2");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText(/Encontrado: José Demo/i)).toBeVisible();
});
