import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs, logout } from "./helpers";

test("atribuir membro a grupo só-leitura muda authz de serviços", async ({
  page,
}) => {
  const name = `SoLeitura ${Date.now()}`;
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao/novo");
  await page.getByLabel(/Nome do grupo/).fill(name);
  await page.locator('[data-permission="services:create"]').uncheck();
  await page.locator('[data-permission="services:update"]').uncheck();
  await page.locator('[data-permission="services:setActive"]').uncheck();
  await page.getByRole("button", { name: "Criar grupo" }).click();

  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.getByLabel(/Grupo de Membro Demo/).selectOption({ label: name });
  await page
    .getByRole("row", { name: /Membro Demo/ })
    .getByRole("button", { name: "Atualizar vínculo" })
    .click();

  await logout(page);
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/servicos");
  await expect(page.getByRole("link", { name: "Novo serviço" })).toHaveCount(0);
  await page.goto("/app/servicos/novo");
  await expect(page).toHaveURL(/\/app\/servicos$/);

  // cleanup: move back to Operadores via admin
  await logout(page);
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: /Operadores/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.getByLabel(/Grupo de Membro Demo/).selectOption({ label: "Operadores" });
  await page
    .getByRole("row", { name: /Membro Demo/ })
    .getByRole("button", { name: "Atualizar vínculo" })
    .click();
});
