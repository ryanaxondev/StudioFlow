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
