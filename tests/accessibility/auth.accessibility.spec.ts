import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("unauthenticated access surfaces have no automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/access");

  const accessResults = await new AxeBuilder({ page }).analyze();
  expect(accessResults.violations).toEqual([]);

  await page.goto("/recover-access?state=unknown-link");

  const recoveryResults = await new AxeBuilder({ page }).analyze();
  expect(recoveryResults.violations).toEqual([]);
});

test("invitation acceptance has no automated accessibility violations", async ({
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
        membershipType: "CLIENT_MEMBER",
        workspaceName: "Northstar Studio",
        clientOrganizationName: "Kestrelon",
        expiresAt: "2026-08-18T12:00:00.000Z",
        identityExists: false,
      }),
    });
  });

  await page.goto("/invite/accessibility-invitation-token");
  await expect(
    page.getByRole("heading", { level: 1, name: "Invitation Acceptance" }),
  ).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeVisible();

  const invitationResults = await new AxeBuilder({ page }).analyze();
  expect(invitationResults.violations).toEqual([]);
});
