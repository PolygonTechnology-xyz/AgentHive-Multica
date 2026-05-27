import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("/ has top nav with Sign in + Get started", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: /sign in/i }).first();
    const getStarted = page.getByRole("link", { name: /get started/i }).first();
    await expect(signIn).toBeVisible();
    await expect(getStarted).toBeVisible();
    await expect(signIn).toHaveAttribute("href", /\/login/);
    await expect(getStarted).toHaveAttribute("href", /\/register/);
  });

  test("clicking Sign in from / lands on /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("clicking Get started from / lands on /register", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started/i }).first().click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("unknown route renders 404 (Not Found) page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-xyz-12345");
    expect(response, "no response").not.toBeNull();
    expect(response!.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText(/page not found/i);
  });

  test("brand link is visible on landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AgentHive", { exact: true }).first()).toBeVisible();
  });
});
