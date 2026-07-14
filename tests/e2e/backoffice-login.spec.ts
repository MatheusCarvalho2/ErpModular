import { expect, test } from "@playwright/test";
import { CREDENTIALS, loginAs, loginPlatformAs } from "./helpers";

test.describe("backoffice login", () => {
  test("platform operator reaches dashboard", async ({ page }) => {
    await loginPlatformAs(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Empresas" })).toBeVisible();
  });

  test("tenant admin cannot login to backoffice", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/backoffice/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator('form[data-ready="true"]')).toBeVisible({
      timeout: 20_000,
    });
    await page.getByLabel("E-mail").fill(CREDENTIALS.admin.email);
    await page.getByLabel("Senha").fill(CREDENTIALS.admin.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/inválidos/i);
    await expect(page).toHaveURL(/\/backoffice\/login/);
  });

  test("unauthenticated /backoffice redirects to dedicated login", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/backoffice", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/backoffice\/login/, { timeout: 15_000 });
  });

  test("ERP login does not open backoffice", async ({ page }) => {
    await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await expect(page).toHaveURL(/\/app/);
    await page.goto("/backoffice", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/backoffice\/login/, { timeout: 15_000 });
  });
});
