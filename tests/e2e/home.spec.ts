import { expect, test } from "@playwright/test";

test("renders the public news homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Sportsfair হোম" })).toBeVisible();
  await expect(page.getByRole("link", { name: "সর্বশেষ" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "আজকের খেলা" })).toBeVisible();
});
