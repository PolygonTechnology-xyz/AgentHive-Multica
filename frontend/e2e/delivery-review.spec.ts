import { expect, test } from "@playwright/test";

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function buyerSessionToken() {
  return `${base64Url(JSON.stringify({ alg: "none", typ: "JWT" }))}.${base64Url(JSON.stringify({ sub: "buyer-1", email: "buyer@example.com", role: "buyer", verified: true }))}.signature`;
}

const delivery = {
  id: "delivery-1",
  jobId: "job-1",
  dispatchId: "dispatch-1",
  revisionRound: 1,
  status: "submitted",
  message: "Delivery is ready for review.",
  submittedBy: "freelancer-1",
  createdAt: "2026-05-30T10:00:00Z",
  attachments: [
    {
      fileId: "file-1",
      name: "handoff.zip",
      sizeBytes: 4096,
      contentType: "application/zip",
      downloadUrl: "https://files.example/handoff.zip",
      expiresAt: "2026-05-31T10:00:00Z",
    },
  ],
};

test.describe("buyer delivery review", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: "agenthive_session", value: buyerSessionToken(), domain: "localhost", path: "/", httpOnly: false, sameSite: "Lax" },
    ]);
    await page.route("**/api/v1/jobs/job-1/deliveries", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [delivery] }) });
    });
  });

  test("blocks short revision notes and posts valid revision request", async ({ page }) => {
    let revisionPosts = 0;
    await page.route("**/api/v1/deliveries/delivery-1/request-revision", async (route) => {
      revisionPosts += 1;
      expect(route.request().method()).toBe("POST");
      expect(await route.request().postDataJSON()).toEqual({ reason: "Please update the handoff notes with setup steps." });
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ revisionId: "rev-1", round: 2 }) });
    });

    await page.goto("/jobs/job-1/delivery");
    await expect(page.getByRole("link", { name: /handoff\.zip/i })).toBeVisible();

    await page.getByPlaceholder(/describe what needs/i).fill("short");
    await page.getByRole("button", { name: /request revision/i }).click();
    await expect(page.getByText("Revision notes must be at least 10 characters.")).toBeVisible();
    expect(revisionPosts).toBe(0);

    await page.getByPlaceholder(/describe what needs/i).fill("Please update the handoff notes with setup steps.");
    await page.getByRole("button", { name: /request revision/i }).click();
    await expect(page).toHaveURL(/\/jobs\/job-1\/progress$/);
    expect(revisionPosts).toBe(1);
  });

  test("requires approve confirmation before POST", async ({ page }) => {
    let approvePosts = 0;
    await page.route("**/api/v1/deliveries/delivery-1/approve", async (route) => {
      approvePosts += 1;
      expect(route.request().method()).toBe("POST");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "approved" }) });
    });

    await page.goto("/jobs/job-1/delivery");
    await page.getByRole("button", { name: /approve/i }).click();
    await expect(page.getByRole("dialog", { name: "Approve and release payment?" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog", { name: "Approve and release payment?" })).toBeHidden();
    expect(approvePosts).toBe(0);

    await page.getByRole("button", { name: /approve/i }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page).toHaveURL(/\/jobs\/job-1\/complete$/);
    expect(approvePosts).toBe(1);
  });
});
