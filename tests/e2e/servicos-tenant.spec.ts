import { test, expect } from "@playwright/test";
import { CREDENTIALS, loginAs } from "./helpers";

test("usuário de outra empresa não vê serviços da Empresa Demo", async ({
  page,
}) => {
  await loginAs(
    page,
    CREDENTIALS.otherAdmin.email,
    CREDENTIALS.otherAdmin.password,
  );
  await page.goto("/app/servicos");
  await expect(page.getByRole("cell", { name: "Serviço Outra" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Troca de óleo" })).toHaveCount(0);
});
