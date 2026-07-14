import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("não-Admin não cria grupo", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/grupos-permissao/novo");
  await expect(page).toHaveURL(/\/app$/);
});
