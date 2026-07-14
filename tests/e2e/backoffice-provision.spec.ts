import { expect, test } from "@playwright/test";
import { CREDENTIALS, loginAs, loginPlatformAs } from "./helpers";

test("provision company + user then ERP login as Admin", async ({ page }) => {
  const suffix = Date.now();
  const companyName = `Cliente E2E ${suffix}`;
  const email = `admin.e2e.${suffix}@test.local`;
  const password = "TempPass123!";

  await loginPlatformAs(page);
  await page.getByRole("link", { name: "Empresas" }).click();
  await page.getByRole("link", { name: "Nova empresa" }).click();
  await page.getByLabel("Nome da empresa").fill(companyName);
  await page.getByRole("button", { name: "Criar empresa" }).click();
  await expect(page).toHaveURL(/\/backoffice\/empresas/, { timeout: 15_000 });
  await expect(page.getByText(companyName)).toBeVisible();

  await page.getByRole("link", { name: "Usuários" }).click();
  await page.getByRole("link", { name: "Novo usuário" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(`Admin ${suffix}`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha inicial").fill(password);
  await page.getByLabel("Empresa").selectOption({ label: companyName });
  await page.getByRole("button", { name: "Criar usuário" }).click();
  await expect(page).toHaveURL(/\/backoffice\/usuarios/, { timeout: 15_000 });
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/backoffice\/login/, { timeout: 15_000 });

  await loginAs(page, email, password);
  await expect(page.getByRole("link", { name: "Grupos de permissão" })).toBeVisible({
    timeout: 15_000,
  });
});

test("duplicate email is rejected", async ({ page }) => {
  await loginPlatformAs(page);
  await page.getByRole("link", { name: "Usuários" }).click();
  await page.getByRole("link", { name: "Novo usuário" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Dup");
  await page.getByLabel("E-mail").fill(CREDENTIALS.admin.email);
  await page.getByLabel("Senha inicial").fill("Whatever123!");
  await page.getByLabel("Empresa").selectOption({ label: "Empresa Demo" });
  await page.getByRole("button", { name: "Criar usuário" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/já existe/i);
});
