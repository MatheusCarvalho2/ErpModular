import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores pode abrir formulário de nova OS", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/ordens-servico/novo");
  await expect(page.getByRole("button", { name: "Salvar ordem" })).toBeVisible();
});
