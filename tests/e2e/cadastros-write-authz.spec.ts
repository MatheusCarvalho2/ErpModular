import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores vê ações de escrita em produtos e clientes", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/produtos");
  await expect(page.getByRole("link", { name: "Novo produto" })).toBeVisible();
  await page.goto("/app/clientes");
  await expect(page.getByRole("link", { name: "Novo cliente" })).toBeVisible();
});
