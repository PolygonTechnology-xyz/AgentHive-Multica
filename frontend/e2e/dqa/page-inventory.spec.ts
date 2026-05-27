import { expect, test } from "@playwright/test";

/**
 * DQA — every route in docs/design-reference/design-system.md must exist.
 * Dynamic routes ([id], [handle]) are excluded since they need real data.
 *
 * For public/auth routes: response is 200.
 * For protected routes: response is 200 after redirect, or directly redirected
 * to a /login* page — both prove the route is wired.
 */

type RouteSpec = { path: string; kind: "public" | "auth" | "protected" };

const routes: RouteSpec[] = [
  // Public / Marketing
  { path: "/", kind: "public" },
  { path: "/hire-agents", kind: "public" },
  { path: "/find-work", kind: "public" },
  { path: "/about", kind: "public" },
  { path: "/pricing", kind: "public" },

  // Auth
  { path: "/register", kind: "auth" },
  { path: "/register/buyer", kind: "auth" },
  { path: "/register/buyer/verify", kind: "auth" },
  { path: "/register/buyer/verified", kind: "auth" },
  { path: "/register/freelancer", kind: "auth" },
  { path: "/register/freelancer/verify", kind: "auth" },
  { path: "/register/freelancer/verified", kind: "auth" },
  { path: "/login", kind: "auth" },
  { path: "/login/buyer", kind: "auth" },
  { path: "/login/freelancer", kind: "auth" },
  { path: "/forgot-password", kind: "auth" },

  // Buyer (protected)
  { path: "/dashboard/buyer", kind: "protected" },
  { path: "/jobs/create", kind: "protected" },
  { path: "/jobs", kind: "protected" },
  { path: "/payments", kind: "protected" },
  { path: "/account/buyer", kind: "protected" },
  { path: "/notifications/buyer", kind: "protected" },

  // Freelancer (protected)
  { path: "/dashboard/freelancer", kind: "protected" },
  { path: "/jobs/freelancer", kind: "protected" },
  { path: "/agents", kind: "protected" },
  { path: "/configuration", kind: "protected" },
  { path: "/cli-guide", kind: "protected" },
  { path: "/settings", kind: "protected" },
  { path: "/payments/freelancer", kind: "protected" },
  { path: "/account/freelancer", kind: "protected" },
  { path: "/notifications/freelancer", kind: "protected" },
];

test.describe("DQA — page inventory", () => {
  for (const { path, kind } of routes) {
    test(`${path} (${kind}) exists`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response, `no response from ${path}`).not.toBeNull();
      const status = response!.status();
      if (kind === "protected") {
        // Must either land on the page (after 2xx) or be redirected to /login*.
        expect(status, `${path} returned ${status}`).toBeLessThan(400);
        const finalUrl = page.url();
        const onLogin = /\/login(\/(buyer|freelancer|admin))?(\?|$|\/)/.test(finalUrl);
        const onPage = finalUrl.endsWith(path);
        expect(
          onLogin || onPage,
          `protected ${path} should land on the page or /login*, got ${finalUrl}`,
        ).toBeTruthy();
      } else {
        expect(status, `${path} returned ${status}`).toBeLessThan(400);
      }
    });
  }
});
