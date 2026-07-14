import { expect, test } from "@playwright/test";
import { loginPlatformAs } from "./helpers";

test("reset password forces change before /app", async ({ page }) => {
  const suffix = String(Date.now());
  const companyName = `Reset Co ${suffix}`;
  const email = `reset.${suffix}@test.local`;
  const initial = "Initial123!";
  const temporary = "Temporary123!";
  const next = "Changed123!";

  await loginPlatformAs(page);
  await page.getByRole("link", { name: "Empresas" }).click();
  await page.getByRole("link", { name: "Nova empresa" }).click();
  await page.getByLabel("Nome da empresa").fill(companyName);
  await page.getByRole("button", { name: "Criar empresa" }).click();
  await expect(page.getByText(companyName)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: "Usuários" }).click();
  await page.getByRole("link", { name: "Novo usuário" }).click();
  await page.getByLabel("Nome", { exact: true }).fill(`Reset ${suffix}`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha inicial").fill(initial);
  await page.getByLabel("Empresa").selectOption({ label: companyName });
  await page.getByRole("button", { name: "Criar usuário" }).click();
  await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });

  await page.locator("tr", { hasText: email }).getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Senha temporária").fill(temporary);
  await page.getByRole("button", { name: "Redefinir senha" }).click();
  await expect(page.getByRole("status")).toContainText(/temporária/i, {
    timeout: 10_000,
  });

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/backoffice\/login/, { timeout: 15_000 });
  await page.context().clearCookies();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(temporary);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/change-password/, { timeout: 20_000 });

  await page.getByLabel("Senha atual (temporária)").fill(temporary);
  await page.getByLabel("Nova senha", { exact: true }).fill(next);
  await page.getByLabel("Confirmar nova senha").fill(next);
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });
});
