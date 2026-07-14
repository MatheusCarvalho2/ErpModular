import { expect, type Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  email: string,
  password: string,
) {
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });
}

export async function loginPlatformAs(
  page: Page,
  email: string = CREDENTIALS.platform.email,
  password: string = CREDENTIALS.platform.password,
) {
  await page.context().clearCookies();
  await page.goto("/backoffice/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/backoffice$/, { timeout: 20_000 });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  await expect(page.locator('form[data-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
}

export const CREDENTIALS = {
  admin: { email: "admin@demo.local", password: "Admin123!" },
  member: { email: "membro@demo.local", password: "Membro123!" },
  otherAdmin: { email: "admin@outra.local", password: "Admin123!" },
  platform: { email: "plataforma@demo.local", password: "Admin123!" },
  inactiveUser: { email: "inativo@demo.local", password: "Membro123!" },
} as const;
