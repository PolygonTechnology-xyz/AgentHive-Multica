import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
let currentPath = "/dashboard/freelancer";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: pushMock }),
}));

const apiFetchMock = vi.fn();
vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  ApiError: class ApiError extends Error {},
}));

const useFetchMock = vi.fn();
vi.mock("@/hooks/useFetch", () => ({
  useFetch: (...args: unknown[]) => useFetchMock(...args),
}));

import { FreelancerNav } from "./FreelancerNav";

beforeEach(() => {
  pushMock.mockReset();
  apiFetchMock.mockReset();
  useFetchMock.mockReset();
  useFetchMock.mockReturnValue({ data: undefined });
  currentPath = "/dashboard/freelancer";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("FreelancerNav", () => {
  it("renders brand and primary links", () => {
    render(<FreelancerNav />);
    expect(screen.getByRole("link", { name: "AgentHive" })).toHaveAttribute("href", "/dashboard/freelancer");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/freelancer");
    expect(screen.getByRole("link", { name: "Jobs" })).toHaveAttribute("href", "/jobs/freelancer");
    expect(screen.getByRole("link", { name: "My Agent" })).toHaveAttribute("href", "/agents");
    expect(screen.getByRole("link", { name: "Config" })).toHaveAttribute("href", "/configuration");
  });

  it("marks Dashboard link active on dashboard path", () => {
    currentPath = "/dashboard/freelancer";
    render(<FreelancerNav />);
    expect(screen.getByRole("link", { name: "Dashboard" }).className).toMatch(/active/);
  });

  it("marks Jobs link active on /jobs/freelancer sub-routes", () => {
    currentPath = "/jobs/freelancer/123";
    render(<FreelancerNav />);
    expect(screen.getByRole("link", { name: "Jobs" }).className).toMatch(/active/);
  });

  it("renders default avatar letter F when no email", () => {
    render(<FreelancerNav />);
    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("F");
  });

  it("renders email first letter uppercase", () => {
    render(<FreelancerNav email="alex@x.com" />);
    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("A");
  });

  it("renders unread count badge", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 4 } } });
    render(<FreelancerNav />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("caps unread badge at 9+", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 12 } } });
    render(<FreelancerNav />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("does not render badge for zero unread", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 0 } } });
    const { container } = render(<FreelancerNav />);
    expect(container.textContent).not.toMatch(/^\d/);
  });

  it("logout posts and pushes /login/freelancer", async () => {
    apiFetchMock.mockResolvedValueOnce(undefined);
    render(<FreelancerNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
      expect(pushMock).toHaveBeenCalledWith("/login/freelancer");
    });
  });

  it("logout still navigates on apiFetch failure", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("x"));
    render(<FreelancerNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login/freelancer"));
  });

  it("notifications link points to /notifications/freelancer", () => {
    render(<FreelancerNav />);
    expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute("href", "/notifications/freelancer");
  });
});
