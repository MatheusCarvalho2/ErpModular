import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores com default pode abrir novo cliente", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/clientes/novo");
  await expect(page.getByRole("button", { name: "Salvar cliente" })).toBeVisible();
});
