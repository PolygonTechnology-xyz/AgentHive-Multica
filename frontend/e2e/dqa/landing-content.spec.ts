import { expect, test } from "@playwright/test";

test.describe("DQA — landing content", () => {
  test("renders hero with headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(/your work/i);
    await expect(page.locator("h1").first()).toContainText(/agents/i);
  });

  test("AgentHive brand string is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AgentHive", { exact: true }).first()).toBeVisible();
  });

  test("at least 3 feature cards are rendered", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("h3");
    const count = await cards.count();
    expect(count, `expected >=3 feature cards (h3), got ${count}`).toBeGreaterThanOrEqual(3);
  });

  test("primary CTA uses --accent (#00ff88) as its background", async ({ page }) => {
    await page.goto("/");
    // The first primary CTA links to /register/buyer per the landing page.
    const primary = page.getByRole("link", { name: /hire an agent/i }).first();
    await expect(primary).toBeVisible();
    const bg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #00ff88 == rgb(0, 255, 136)
    expect(bg.replace(/\s/g, "")).toBe("rgb(0,255,136)");
  });
});
