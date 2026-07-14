import { expect, test } from "@playwright/test";
import { CREDENTIALS, loginAs, loginPlatformAs } from "./helpers";

test("inactivate and reactivate user blocks ERP login", async ({ page }) => {
  const suffix = Date.now();
  const email = `toggle.user.${suffix}@test.local`;
  const password = "Toggle123!";

  await loginPlatformAs(page);
  await page.getByRole("link", { name: "Usuários" }).click();
  await page.getByRole("link", { name: "Novo usuário" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(`Toggle ${suffix}`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha inicial").fill(password);
  await page.getByLabel("Empresa").selectOption({ label: "Empresa Demo" });
  await page.getByRole("button", { name: "Criar usuário" }).click();
  await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });

  const row = page.locator("tr", { hasText: email });
  await row.getByRole("button", { name: "Inativar" }).click();
  await expect(row.getByText("Inativo")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/backoffice\/login/, { timeout: 15_000 });
  await page.context().clearCookies();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator('p[role="alert"]')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/login/);

  await loginPlatformAs(page);
  await page.getByRole("link", { name: "Usuários" }).click();
  const row2 = page.locator("tr", { hasText: email });
  await row2.getByRole("button", { name: "Reativar" }).click();
  await expect(row2.getByText("Ativo")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Sair" }).click();

  await loginAs(page, email, password);
});

test("seed inactive user cannot login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("E-mail").fill(CREDENTIALS.inactiveUser.email);
  await page.getByLabel("Senha").fill(CREDENTIALS.inactiveUser.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator('p[role="alert"]')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/login/);
});
