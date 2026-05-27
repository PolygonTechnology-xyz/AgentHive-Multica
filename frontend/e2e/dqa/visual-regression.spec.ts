import { expect, test } from "@playwright/test";

/**
 * Visual regression baselines for key public/auth pages.
 * First run generates baselines into e2e/dqa/__screenshots__/.
 * Commit those baselines so subsequent runs catch drift > 2% pixel ratio.
 */

const targets: { path: string; name: string }[] = [
  { path: "/", name: "landing" },
  { path: "/login", name: "login" },
  { path: "/register", name: "register" },
];

test.use({ viewport: { width: 1280, height: 800 } });

for (const { path, name } of targets) {
  test(`DQA visual — ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    // Wait for fonts so screenshot is deterministic.
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
      fullPage: true,
    });
  });
}
