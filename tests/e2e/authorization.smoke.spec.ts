import { expect, test } from "@playwright/test";

test("protected product shells require authentication", async ({ page }) => {
  await page.goto("/agency");
  await expect(page).toHaveURL(/\/access\?returnTo=%2Fagency$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to StudioFlow" }),
  ).toBeVisible();

  await page.goto("/portal");
  await expect(page).toHaveURL(/\/access\?returnTo=%2Fportal$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to StudioFlow" }),
  ).toBeVisible();
});

test("access denied stays generic for an unauthenticated request", async ({
  page,
}) => {
  await page.goto("/access-denied");

  await expect(
    page.getByRole("heading", { level: 1, name: "Access Denied" }),
  ).toBeVisible();
  await expect(page.getByText("Return to sign in")).toBeVisible();
  await expect(page.getByText("Switch account")).not.toBeVisible();
  await expect(
    page.getByText(/Project title|Client Organization|Workspace ID/i),
  ).not.toBeVisible();
});
