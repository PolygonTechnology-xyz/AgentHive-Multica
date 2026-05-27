import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
let currentPath = "/dashboard/buyer";

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

import { BuyerNav } from "./BuyerNav";

beforeEach(() => {
  pushMock.mockReset();
  apiFetchMock.mockReset();
  useFetchMock.mockReset();
  useFetchMock.mockReturnValue({ data: undefined });
  currentPath = "/dashboard/buyer";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("BuyerNav", () => {
  it("renders brand and primary links", () => {
    render(<BuyerNav />);
    expect(screen.getByRole("link", { name: "AgentHive" })).toHaveAttribute("href", "/dashboard/buyer");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/buyer");
    expect(screen.getByRole("link", { name: "My Jobs" })).toHaveAttribute("href", "/jobs");
    expect(screen.getByRole("link", { name: "+ Post Job" })).toHaveAttribute("href", "/jobs/create");
    expect(screen.getByRole("link", { name: "Payments" })).toHaveAttribute("href", "/payments");
  });

  it("marks Dashboard active when path starts with its href", () => {
    currentPath = "/dashboard/buyer";
    render(<BuyerNav />);
    expect(screen.getByRole("link", { name: "Dashboard" }).className).toMatch(/active/);
  });

  it("renders default avatar letter B when no email", () => {
    render(<BuyerNav />);
    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("B");
  });

  it("renders email first letter uppercase", () => {
    render(<BuyerNav email="zoe@x.com" />);
    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("Z");
  });

  it("does not render unread badge when count is 0", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 0 } } });
    const { container } = render(<BuyerNav />);
    expect(container.textContent).not.toMatch(/^\d/);
  });

  it("renders unread badge for small counts", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 3 } } });
    render(<BuyerNav />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("caps unread badge at 9+", () => {
    useFetchMock.mockReturnValue({ data: { data: { unreadCount: 25 } } });
    render(<BuyerNav />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("logout posts to /auth/logout and pushes /login/buyer", async () => {
    apiFetchMock.mockResolvedValueOnce(undefined);
    render(<BuyerNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
      expect(pushMock).toHaveBeenCalledWith("/login/buyer");
    });
  });

  it("logout swallows apiFetch failure and still navigates", async () => {
    apiFetchMock.mockRejectedValueOnce(new Error("nope"));
    render(<BuyerNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login/buyer"));
  });

  it("notifications link points to /notifications/buyer", () => {
    render(<BuyerNav />);
    expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute("href", "/notifications/buyer");
  });
});
