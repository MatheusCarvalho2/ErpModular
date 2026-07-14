import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("lista produtos ativos do seed", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/produtos");
  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Air fryer/i })).toBeVisible();
});
