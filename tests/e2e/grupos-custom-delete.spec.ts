import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs, logout } from "./helpers";

test("excluir personalizado reassocia a Operadores; presets não excluem; nome duplicado", async ({
  page,
}) => {
  const name = `Temp ${Date.now()}`;
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);

  await page.goto("/app/grupos-permissao/novo");
  await page.getByLabel(/Nome do grupo/).fill(name);
  await page.getByRole("button", { name: "Criar grupo" }).click();
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

  // duplicate name
  await page.goto("/app/grupos-permissao/novo");
  await page.getByLabel(/Nome do grupo/).fill(name);
  await page.getByRole("button", { name: "Criar grupo" }).click();
  await expect(page.locator("p[role='alert']")).toContainText(/já existe/i);

  // assign member to custom group
  await page.goto("/app/grupos-permissao");
  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("link", { name: "Editar" })
    .click();
  const memberSelect = page.getByLabel(/Grupo de Membro Demo/);
  await memberSelect.selectOption({ label: name });
  await page
    .getByRole("row", { name: /Membro Demo/ })
    .getByRole("button", { name: "Atualizar vínculo" })
    .click();

  // delete custom → back to Operadores
  await page.goto("/app/grupos-permissao");
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("button", { name: "Excluir" })
    .click();
  await expect(page.getByRole("cell", { name, exact: true })).toHaveCount(0);

  // presets have no delete
  await expect(
    page.getByRole("row", { name: /^Admin\b/ }).getByRole("button", { name: "Excluir" }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("row", { name: /Operadores/ })
      .getByRole("button", { name: "Excluir" }),
  ).toHaveCount(0);

  // member can create again (Operadores default)
  await logout(page);
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/servicos/novo");
  await expect(page.getByRole("button", { name: "Salvar serviço" })).toBeVisible();
});
