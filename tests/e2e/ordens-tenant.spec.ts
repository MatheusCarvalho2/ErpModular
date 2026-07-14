import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("outra empresa não vê OS da Demo (José Demo)", async ({ page }) => {
  await loginAs(
    page,
    CREDENTIALS.otherAdmin.email,
    CREDENTIALS.otherAdmin.password,
  );
  await page.goto("/app/ordens-servico");
  await expect(page.getByRole("row", { name: /José Demo/i })).toHaveCount(0);
});
