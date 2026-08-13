import { expect, test } from "@playwright/test";

test("access and recovery surfaces render", async ({ page }) => {
  await page.goto("/access");

  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to StudioFlow" }),
  ).toBeVisible();
  await expect(page.getByLabel("Work email")).toBeVisible();

  await page.goto("/recover-access?state=unknown-link");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Invitation and Link Recovery",
    }),
  ).toBeVisible();
  await expect(page.getByText("Unknown link")).toBeVisible();
});

test("unapproved Better Auth HTTP endpoints remain closed", async ({
  request,
}) => {
  const getSession = await request.get("/api/auth/get-session");
  expect(getSession.status()).toBe(404);

  const directMagicLink = await request.post("/api/auth/sign-in/magic-link", {
    data: {
      email: "member@example.com",
      callbackURL: "/account",
    },
  });
  expect(directMagicLink.status()).toBe(404);

  const refreshWithoutOrigin = await request.post(
    "/api/access/session/refresh",
  );
  expect(refreshWithoutOrigin.status()).toBe(403);
});

test("access request reports success without a client-side error", async ({
  page,
}) => {
  await page.route("**/api/access/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "request-sent",
      }),
    });
  });

  await page.goto("/access");

  await page.getByLabel("Work email").fill("unknown-browser-user@example.com");
  await page
    .getByRole("button", {
      name: "Continue with email",
    })
    .click();

  await expect(
    page.getByText("Check your inbox for a secure sign-in link."),
  ).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByText("We couldn’t send a sign-in link. Try again."),
  ).not.toBeVisible();
});
