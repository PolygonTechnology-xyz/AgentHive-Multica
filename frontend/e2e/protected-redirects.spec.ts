import { expect, test } from "@playwright/test";

type ProtectedRoute = {
  path: string;
  /** The login page the unauthenticated user should be redirected to. */
  loginRe: RegExp;
};

const protectedRoutes: ProtectedRoute[] = [
  { path: "/dashboard/buyer", loginRe: /\/login\/buyer$/ },
  { path: "/dashboard/freelancer", loginRe: /\/login\/freelancer$/ },
  { path: "/jobs", loginRe: /\/login\/buyer$/ },
  { path: "/jobs/create", loginRe: /\/login\/buyer$/ },
  { path: "/payments", loginRe: /\/login\/buyer$/ },
  { path: "/account/buyer", loginRe: /\/login\/buyer$/ },
  { path: "/notifications/buyer", loginRe: /\/login\/buyer$/ },
  { path: "/agents", loginRe: /\/login\/freelancer$/ },
  { path: "/configuration", loginRe: /\/login\/freelancer$/ },
  { path: "/cli-guide", loginRe: /\/login\/freelancer$/ },
  { path: "/settings", loginRe: /\/login\/freelancer$/ },
  { path: "/payments/freelancer", loginRe: /\/login\/freelancer$/ },
  { path: "/account/freelancer", loginRe: /\/login\/freelancer$/ },
  { path: "/notifications/freelancer", loginRe: /\/login\/freelancer$/ },
  { path: "/jobs/freelancer", loginRe: /\/login\/freelancer$/ },
  { path: "/admin", loginRe: /\/login(\/admin)?$/ },
];

test.describe("Protected route redirects (unauthenticated)", () => {
  for (const { path, loginRe } of protectedRoutes) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(loginRe);
    });
  }
});
