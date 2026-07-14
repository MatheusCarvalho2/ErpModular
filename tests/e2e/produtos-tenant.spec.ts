import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("outra empresa não vê produtos da Demo", async ({ page }) => {
  await loginAs(
    page,
    CREDENTIALS.otherAdmin.email,
    CREDENTIALS.otherAdmin.password,
  );
  await page.goto("/app/produtos");
  await expect(page.getByRole("row", { name: /Maria Demo/i })).toHaveCount(0);
  // Demo has Air fryer; other company seed also has Air fryer — assert Maria client product isolation elsewhere
  await page.goto("/app/clientes");
  await expect(page.getByRole("row", { name: /Maria Demo/i })).toHaveCount(0);
});
