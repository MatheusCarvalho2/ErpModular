import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs, logout } from "./helpers";

test("admin e Operadores veem serviço ativo seed", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/servicos");
  await expect(page.getByRole("cell", { name: "Troca de óleo" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Alinhamento" })).toHaveCount(0);

  await logout(page);
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/servicos");
  await expect(page.getByRole("cell", { name: "Troca de óleo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Editar" }).first()).toBeVisible();
});
