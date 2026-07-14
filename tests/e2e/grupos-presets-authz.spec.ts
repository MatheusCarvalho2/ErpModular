import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores não acessa gestão de grupos", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/grupos-permissao");
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("link", { name: "Grupos de permissão" }),
  ).toHaveCount(0);
});
