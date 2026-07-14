import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("criar OS sem campos obrigatórios é rejeitado", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico/novo");
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await expect(page).toHaveURL(/\/app\/ordens-servico\/novo/);
});
