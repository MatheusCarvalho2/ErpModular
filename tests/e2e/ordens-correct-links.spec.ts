import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("membro não vê correção de vínculos; admin vê", async ({ page }) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/ordens-servico");
  await page.getByRole("link", { name: /José Demo/i }).first().click();
  await expect(
    page.getByRole("heading", { name: /Corrigir vínculos/i }),
  ).toHaveCount(0);

  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico");
  await page.getByRole("link", { name: /José Demo/i }).first().click();
  await expect(
    page.getByRole("heading", { name: /Corrigir vínculos/i }),
  ).toBeVisible();
});
