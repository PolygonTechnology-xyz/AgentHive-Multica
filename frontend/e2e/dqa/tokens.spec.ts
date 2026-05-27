import { expect, test } from "@playwright/test";

/**
 * DQA — every CSS variable from the design system must exist on :root with the
 * exact value declared in docs/design-reference/design-system.md.
 *
 * Browsers normalize 6-digit hex to 3-digit shorthand when possible
 * (e.g. #00ff88 → #0f8). We compare on normalized form to avoid false negatives.
 */
const expectedTokens: Record<string, string> = {
  "--bg": "#08080c",
  "--bg-1": "#0c0c12",
  "--bg-2": "#11111a",
  "--text": "#f1f1f4",
  "--text-dim": "#9a9aa6",
  "--text-faint": "#5d5d6b",
  "--accent": "#00ff88",
  "--accent-dim": "#00cc6b",
  "--accent-deep": "#003a1f",
  "--violet": "#a78bfa",
  "--cyan": "#67e8f9",
  "--warn": "#fbbf24",
  "--radius-sm": "6px",
  "--radius": "12px",
  "--radius-lg": "20px",
};

function expand(hex: string): string {
  const h = hex.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) {
    return "#" + h.slice(1).split("").map((c) => c + c).join("");
  }
  return h;
}

test.describe("DQA — :root color and radius tokens", () => {
  test("all design-system tokens match exactly", async ({ page }) => {
    await page.goto("/");
    const actual = await page.evaluate((keys) => {
      const cs = getComputedStyle(document.documentElement);
      const out: Record<string, string> = {};
      for (const key of keys) out[key] = cs.getPropertyValue(key).trim().toLowerCase();
      return out;
    }, Object.keys(expectedTokens));

    const mismatches: string[] = [];
    for (const [key, expected] of Object.entries(expectedTokens)) {
      const got = actual[key];
      const gotNorm = got.startsWith("#") ? expand(got) : got;
      const expNorm = expected.startsWith("#") ? expand(expected) : expected.toLowerCase();
      if (gotNorm !== expNorm) {
        mismatches.push(`${key}: expected "${expected}", got "${got || "(empty)"}"`);
      }
    }
    expect(mismatches, mismatches.join("\n")).toEqual([]);
  });
});
