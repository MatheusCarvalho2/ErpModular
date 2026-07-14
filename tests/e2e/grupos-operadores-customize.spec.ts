import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs, logout } from "./helpers";

async function openOperadoresEdit(page: import("@playwright/test").Page) {
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: /Operadores/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await expect(page.getByTestId("permission-matrix")).toBeVisible();
}

async function setCreateGrant(
  page: import("@playwright/test").Page,
  enabled: boolean,
) {
  await openOperadoresEdit(page);
  const box = page.locator('[data-permission="services:create"]');
  if (enabled) {
    await box.check();
  } else {
    await box.uncheck();
  }
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.reload();
  await expect(page.getByTestId("permission-matrix")).toBeVisible();
  if (enabled) {
    await expect(page.locator('[data-permission="services:create"]')).toBeChecked();
  } else {
    await expect(page.locator('[data-permission="services:create"]')).not.toBeChecked();
  }
}

test("desligar create em Operadores bloqueia novo serviço do membro", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await setCreateGrant(page, false);

  try {
    await logout(page);
    await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
    await page.goto("/app/servicos/novo");
    await expect(page).toHaveURL(/\/app\/servicos$/);
    await expect(page.getByRole("button", { name: "Salvar serviço" })).toHaveCount(0);
  } finally {
    await page.context().clearCookies();
    await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await setCreateGrant(page, true);
  }
});
