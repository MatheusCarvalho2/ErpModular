import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("bloqueia remoção do último Admin", async ({ page }) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: /^Admin\b/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.getByLabel(/Grupo de Admin Demo/).selectOption({ label: "Operadores" });
  await page
    .getByRole("row", { name: /Admin Demo/ })
    .getByRole("button", { name: "Atualizar vínculo" })
    .click();
  await expect(page.locator("p[role='alert']")).toContainText(/pelo menos um/i);
});
