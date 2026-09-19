import { expect, test } from "@playwright/test";

test("renders the starter app", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Next.js development scaffold" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Increase counter" })).toBeVisible();
});
