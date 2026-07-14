import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("admin inativa status não-padrão e ele some do select de nova OS", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/ordens-servico/status");

  const unique = `Temp Status ${Date.now()}`;
  await page.getByLabel("Nome").fill(unique);
  await page.getByLabel("Ordem de exibição").fill("80");
  await page.getByRole("button", { name: "Salvar status" }).click();
  await expect(page.getByRole("row", { name: new RegExp(unique) })).toBeVisible();

  const row = page.getByRole("row", { name: new RegExp(unique) });
  await row.getByRole("button", { name: "Inativar" }).click();
  await expect(row.getByRole("button", { name: "Reativar" })).toBeVisible();

  await page.goto("/app/ordens-servico/novo");
  const options = await page.getByLabel("Status").locator("option").allTextContents();
  expect(options.some((text) => text.includes(unique))).toBe(false);
});
