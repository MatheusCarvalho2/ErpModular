import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin vê status base com papéis", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico/status");
  await expect(page.getByRole("row", { name: /Recebido/i })).toBeVisible();
  await expect(page.getByRole("row", { name: /Pronto/i })).toBeVisible();
  await expect(page.getByRole("row", { name: /Finalizado/i }).first()).toBeVisible();
});
