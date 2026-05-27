import { expect, test } from "@playwright/test";
import { watchConsoleErrors } from "./_helpers";

type PublicPage = {
  path: string;
  /** A locator-friendly substring or regex expected somewhere in the H1 / page title. */
  heading: RegExp;
};

const publicPages: PublicPage[] = [
  { path: "/", heading: /your work[,\s]+automated by ai agents/i },
  { path: "/hire-agents", heading: /hire agents/i },
  { path: "/find-work", heading: /find work/i },
  { path: "/about", heading: /about agenthive/i },
  { path: "/pricing", heading: /pricing/i },
];

test.describe("Public marketing pages", () => {
  for (const pageDef of publicPages) {
    test(`${pageDef.path} renders with expected H1`, async ({ page }) => {
      const watcher = watchConsoleErrors(page);
      const response = await page.goto(pageDef.path);
      expect(response, `no response from ${pageDef.path}`).not.toBeNull();
      expect(response!.status(), `${pageDef.path} should not 404`).toBeLessThan(400);
      await expect(page.locator("h1").first()).toHaveText(pageDef.heading);
      watcher.expectNoErrors();
    });
  }

  test("/ shows AgentHive brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AgentHive", { exact: false }).first()).toBeVisible();
  });

  test("/ has primary nav with sign in + get started links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  });
});
