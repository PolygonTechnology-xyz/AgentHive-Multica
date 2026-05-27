import type { ConsoleMessage, Page } from "@playwright/test";

/**
 * Attach a console listener and return a function that asserts no error-level
 * messages were logged. Filters out known noise (e.g. dev HMR, Next.js fast
 * refresh, network failures that originate from the backend not being up).
 */
export function watchConsoleErrors(page: Page) {
  const errors: string[] = [];
  const ignore = [
    /Failed to load resource/i,
    /favicon\.ico/i,
    /\[Fast Refresh\]/i,
    /Download the React DevTools/i,
    /next-route-announcer/i,
    /hydrat/i, // hydration warnings show as errors but are not page-fatal — filter for now
    /NEXT_NOT_FOUND/i,
  ];
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (ignore.some((re) => re.test(text))) return;
    errors.push(text);
  };
  page.on("console", handler);
  return {
    errors,
    expectNoErrors: () => {
      if (errors.length > 0) {
        throw new Error("Console errors detected:\n" + errors.join("\n"));
      }
    },
  };
}

export const backendRequired = !!process.env.E2E_WITH_BACKEND;
