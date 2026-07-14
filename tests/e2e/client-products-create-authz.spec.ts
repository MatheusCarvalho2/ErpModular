import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("Operadores com default vê formulário de vínculo no cliente", async ({
  page,
}) => {
  await loginAs(page, CREDENTIALS.member.email, CREDENTIALS.member.password);
  await page.goto("/app/clientes");
  await page.getByRole("link", { name: "Maria Demo" }).click();
  await expect(
    page.getByRole("button", { name: "Vincular produto" }),
  ).toBeVisible();
});
