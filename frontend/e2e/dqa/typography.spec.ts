import { expect, test } from "@playwright/test";

/**
 * Next.js `next/font` injects font-family as a generated class name like
 * `__Space_Grotesk_49a339`. We match either the literal font name or the
 * generated identifier so the test passes in both dev and prod modes.
 */
test.describe("DQA — typography", () => {
  test("body font-family resolves to Space Grotesk", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontFamily, `body font-family was "${fontFamily}"`).toMatch(/Space[_ ]Grotesk/i);
  });

  test(".mono class uses JetBrains Mono", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-mono-check");
    const monoLocator = page.locator(".mono").first();
    await expect(monoLocator).toBeVisible();
    const fontFamily = await monoLocator.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily, `.mono font-family was "${fontFamily}"`).toMatch(/JetBrains[_ ]Mono/i);
  });

  test("font smoothing and feature settings applied to body", async ({ page }) => {
    await page.goto("/");
    const { smoothing, featureSettings } = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return {
        smoothing: cs.getPropertyValue("-webkit-font-smoothing"),
        featureSettings: cs.fontFeatureSettings,
      };
    });
    expect(smoothing).toBe("antialiased");
    expect(featureSettings).toMatch(/ss01/);
    expect(featureSettings).toMatch(/cv01/);
  });
});
