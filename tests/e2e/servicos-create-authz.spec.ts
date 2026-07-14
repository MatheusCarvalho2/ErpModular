import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores com default pode abrir formulário de novo serviço", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/servicos/novo");
  await expect(page.getByRole("button", { name: "Salvar serviço" })).toBeVisible();
});
