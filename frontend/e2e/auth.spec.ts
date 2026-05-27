import { expect, test } from "@playwright/test";

test.describe("Login pages", () => {
  test("/login shows role selector with buyer + freelancer", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toHaveText(/sign in/i);
    await expect(page.getByRole("link", { name: /buyer/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /freelancer/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("/login/buyer renders email + password form", async ({ page }) => {
    await page.goto("/login/buyer");
    await expect(page.locator("h1")).toHaveText(/buyer sign in/i);
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#email")).toHaveAttribute("type", "email");
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("input#password")).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("/login/freelancer renders email + password form", async ({ page }) => {
    await page.goto("/login/freelancer");
    await expect(page.locator("h1")).toHaveText(/freelancer sign in/i);
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
  });

  test("/login/buyer empty submit triggers HTML5 validation", async ({ page }) => {
    await page.goto("/login/buyer");
    await page.getByRole("button", { name: /sign in/i }).click();
    // The form should not navigate away on empty submit — the email input is required.
    await expect(page).toHaveURL(/\/login\/buyer$/);
    const emailValid = await page.locator("input#email").evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(emailValid).toBe(false);
  });
});

test.describe("Register pages", () => {
  test("/register shows role selector with both options", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toHaveText(/create account/i);
    await expect(page.getByRole("link", { name: /i need work done/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /i offer services/i })).toBeVisible();
  });

  test("/register/buyer renders registration form", async ({ page }) => {
    await page.goto("/register/buyer");
    await expect(page.locator("h1")).toHaveText(/register as buyer/i);
    await expect(page.locator("input#name")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    // Password should require min length 8 per the form.
    await expect(page.locator("input#password")).toHaveAttribute("minlength", "8");
  });

  test("/register/freelancer renders registration form", async ({ page }) => {
    await page.goto("/register/freelancer");
    await expect(page.locator("h1")).toHaveText(/register as freelancer/i);
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
  });
});

test.describe("Forgot password", () => {
  test("/forgot-password renders email form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toHaveText(/reset password/i);
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("/forgot-password optimistic success after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.locator("input#email").fill("test@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.locator("h1")).toHaveText(/check your inbox/i);
  });
});
