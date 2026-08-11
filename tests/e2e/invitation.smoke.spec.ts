import { expect, test } from "@playwright/test";

const token = "browser-invitation-token";

test("invitation acceptance requests a sign-in link for an existing invited identity", async ({
  page,
}) => {
  await page.route("**/api/invitations/presentation", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "valid",
        authenticated: false,
        accountMatches: false,
        membershipType: "WORKSPACE_MEMBER",
        intendedRole: "AGENCY_MEMBER",
        workspaceName: "Northstar Studio",
        expiresAt: "2026-08-18T12:00:00.000Z",
        identityExists: true,
      }),
    });
  });
  await page.route("**/api/invitations/access", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "request-sent" }),
    });
  });

  await page.goto(`/invite/${token}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Invitation Acceptance" }),
  ).toBeVisible();
  await expect(page.getByText("Northstar Studio")).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(
    page.getByText("Check your email. The sign-in link will return you here."),
  ).toBeVisible({ timeout: 30_000 });
});

test("invitation acceptance fails safely for the wrong account", async ({
  page,
}) => {
  await page.route("**/api/invitations/presentation", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "wrong-account", authenticated: true }),
    });
  });

  await page.goto(`/invite/${token}`);
  await expect(page.getByText("Wrong account")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Use another account" }),
  ).toBeVisible();
  await expect(page.getByText("Client organization")).toHaveCount(0);
});
