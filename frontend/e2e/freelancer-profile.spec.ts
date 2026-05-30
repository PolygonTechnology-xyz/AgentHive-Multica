import { expect, test } from "@playwright/test";

type Profile = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  bio: string;
  skills: string[];
  photoUrl: string | null;
  joinedAt: string;
};

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sessionToken() {
  return `${base64Url(JSON.stringify({ alg: "none", typ: "JWT" }))}.${base64Url(JSON.stringify({ sub: "user-1", email: "ada@example.com", role: "freelancer", verified: true }))}.sig`;
}

test.describe("Freelancer profile", () => {
  test("edit profile persists after reload and oversized upload is blocked", async ({ page, context }) => {
    let profile: Profile = {
      id: "user-1",
      email: "ada@example.com",
      displayName: "Ada Lovelace",
      handle: "ada-lovelace",
      bio: "Analytical engine specialist",
      skills: ["React"],
      photoUrl: null,
      joinedAt: "2026-01-15T00:00:00.000Z",
    };

    await context.addCookies([{ name: "agenthive_session", value: sessionToken(), domain: "localhost", path: "/" }]);

    await page.route("**/api/v1/users/me", async (route) => {
      const request = route.request();
      if (request.method() === "PATCH") {
        const body = request.postDataJSON() as Partial<Profile>;
        profile = { ...profile, ...body };
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: profile }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: profile }) });
    });

    await page.goto("/account/freelancer");
    await page.getByLabel(/display name/i).fill("Ada Byron");
    await page.getByLabel(/handle/i).fill("ada-byron");
    await page.getByLabel(/bio/i).fill("Computing pioneer and agent systems consultant.");
    await page.getByLabel(/skills/i).fill("TypeScript, Next.js");
    await page.getByRole("button", { name: /save profile/i }).click();
    await expect(page.getByRole("status")).toHaveText(/profile saved/i);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/account\/freelancer$/);
    await expect(page.getByRole("heading", { name: /my profile/i })).toBeVisible();
    await expect(page.getByLabel(/display name/i)).toHaveValue("Ada Byron");
    await expect(page.getByLabel(/handle/i)).toHaveValue("ada-byron");

    const largeFile = Buffer.alloc(6 * 1024 * 1024, 1);
    await page.getByLabel(/upload profile photo/i).setInputFiles({ name: "large.png", mimeType: "image/png", buffer: largeFile });
    await expect(page.getByText("Max 5 MB", { exact: true })).toBeVisible();
  });

  test("public profile renders while unauthenticated", async ({ page }) => {
    test.skip(!process.env.E2E_WITH_BACKEND, "Requires backend fixture for server-rendered public profile fetch.");

    await page.goto("/freelancer/ada-byron");
    await expect(page.getByRole("heading", { name: /ada/i })).toBeVisible();
    await expect(page.getByText(/@ada-byron/i)).toBeVisible();
  });
});
