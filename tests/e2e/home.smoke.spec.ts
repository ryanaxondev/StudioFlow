import { expect, test } from "@playwright/test";

test("home page smoke", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", { level: 1, name: "StudioFlow" }),
  ).toBeVisible();
  await expect(page.getByText("Application foundation")).toBeVisible();
});
