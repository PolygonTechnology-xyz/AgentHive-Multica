import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
let currentPath = "/admin";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: pushMock }),
}));

const apiFetchMock = vi.fn();
vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  ApiError: class ApiError extends Error {},
}));

import { AdminNav } from "./AdminNav";

beforeEach(() => {
  pushMock.mockReset();
  apiFetchMock.mockReset();
  currentPath = "/admin";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminNav", () => {
  it("renders the brand and all primary links", () => {
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "AgentHive" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/admin/accounts");
    expect(screen.getByRole("link", { name: "Disputes" })).toHaveAttribute("href", "/admin/disputes");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/admin/commission");
  });

  it("renders default avatar letter when no email", () => {
    render(<AdminNav />);
    expect(screen.getByRole("button", { name: "Logout" })).toHaveTextContent("A");
  });

  it("renders uppercase first letter of email", () => {
    render(<AdminNav email="moderator@x.com" />);
    expect(screen.getByRole("button", { name: "Logout" })).toHaveTextContent("M");
  });

  it("marks the Overview link active on exact /admin path", () => {
    currentPath = "/admin";
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Overview" }).className).toMatch(/active/);
  });

  it("marks a sub-route link active when path starts with its href", () => {
    currentPath = "/admin/disputes/123";
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Disputes" }).className).toMatch(/active/);
    // Overview should NOT be marked active on a sub-route
    expect(screen.getByRole("link", { name: "Overview" }).className).not.toMatch(/active/);
  });

  it("logout calls /auth/logout and pushes /login", async () => {
    apiFetchMock.mockResolvedValueOnce(undefined);
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("logout still navigates when apiFetch fails", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("nope"));
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
  });
});
