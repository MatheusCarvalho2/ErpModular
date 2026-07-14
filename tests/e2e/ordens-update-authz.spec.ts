import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores pode editar OS operacional", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/ordens-servico");
  await page.getByRole("link", { name: /José Demo/i }).first().click();
  await expect(page.getByRole("button", { name: "Salvar alterações" })).toBeVisible();
});
