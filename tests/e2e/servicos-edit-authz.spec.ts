import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs, logout } from "./helpers";

test("membro Operadores edita; id de outra empresa não encontrado", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await page.goto("/app/servicos");
  const editHref = await page
    .getByRole("link", { name: "Editar" })
    .first()
    .getAttribute("href");
  expect(editHref).toBeTruthy();

  await logout(page);
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto(editHref!);
  await expect(page.getByRole("button", { name: "Salvar alterações" })).toBeVisible();

  await logout(page);
  await loginAs(
    page,
    CREDENTIALS.otherAdmin.email,
    CREDENTIALS.otherAdmin.password,
  );
  const response = await page.goto(editHref!);
  expect(response?.status()).toBe(404);
});
