import { expect, test } from "@playwright/test";

test("visual foundation keeps recovery surfaces composed on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/access-denied");
  await expect(
    page.getByRole("heading", { level: 1, name: "Access Denied" }),
  ).toBeVisible();
  await expect(page.locator(".utility-state-stage")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/access");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to StudioFlow" }),
  ).toBeVisible();
  await expect(page.locator(".access-experience")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");

  await page.goto("/recover-access?state=unknown-link");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Invitation and Link Recovery",
    }),
  ).toBeVisible();
  await expect(page.locator(".shared-access-context-copy > span")).toBeHidden();
  await expect(page.locator(".shared-access-sequence")).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("desktop access entry stays inside the viewport without document scroll", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/access");
    await expect(
      page.getByRole("heading", { level: 1, name: "Sign in to StudioFlow" }),
    ).toBeVisible();

    const overflow = await page.evaluate(() => ({
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
    }));

    expect(overflow.documentHeight).toBeLessThanOrEqual(
      overflow.viewportHeight + 1,
    );
    expect(overflow.bodyHeight).toBeLessThanOrEqual(
      overflow.viewportHeight + 1,
    );
  }
});
