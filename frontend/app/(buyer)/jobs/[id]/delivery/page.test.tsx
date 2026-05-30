import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeliveryPage from "./page";

const push = vi.fn();
const useFetchMock = vi.fn();
const apiFetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "job-1" }),
  useRouter: () => ({ push }),
}));

vi.mock("@/hooks/useFetch", () => ({
  useFetch: (path: string) => useFetchMock(path),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: (...args: unknown[]) => apiFetchMock(...args) };
});

type TestDelivery = {
  id: string;
  jobId: string;
  dispatchId: string;
  revisionRound: number;
  status: "submitted" | "approved" | "revision_requested";
  message: string | null;
  submittedBy: string;
  createdAt: string;
  attachments: Array<{
    fileId: string;
    name: string;
    sizeBytes: number;
    contentType: string;
    downloadUrl: string;
    expiresAt: string;
  }>;
};

const submittedDelivery: TestDelivery = {
  id: "delivery-2",
  jobId: "job-1",
  dispatchId: "dispatch-1",
  revisionRound: 2,
  status: "submitted" as const,
  message: "Updated files are ready.",
  submittedBy: "freelancer-1",
  createdAt: "2026-05-30T10:00:00Z",
  attachments: [
    {
      fileId: "file-1",
      name: "final-report.pdf",
      sizeBytes: 2048,
      contentType: "application/pdf",
      downloadUrl: "https://files.example/final-report.pdf",
      expiresAt: "2026-05-31T10:00:00Z",
    },
  ],
};

function renderWithDeliveries(deliveries: TestDelivery[] = [submittedDelivery]) {
  useFetchMock.mockReturnValue({ data: { data: deliveries }, isLoading: false });
  render(<DeliveryPage />);
}

describe("DeliveryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetchMock.mockResolvedValue({});
  });

  it("fetches job deliveries and renders attachment links from the delivery shape", () => {
    renderWithDeliveries();

    expect(useFetchMock).toHaveBeenCalledWith("/jobs/job-1/deliveries");
    const attachment = screen.getByRole("link", { name: /final-report\.pdf/i });
    expect(attachment).toHaveAttribute("href", "https://files.example/final-report.pdf");
    expect(screen.getByText("Round 2")).toBeInTheDocument();
  });

  it("hides buyer actions when the latest delivery is not submitted", () => {
    renderWithDeliveries([{ ...submittedDelivery, status: "approved" as const }]);

    expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request revision/i })).not.toBeInTheDocument();
  });

  it("blocks short revision notes before posting", () => {
    renderWithDeliveries();

    fireEvent.change(screen.getByPlaceholderText(/describe what needs/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /request revision/i }));

    expect(screen.getByText("Revision notes must be at least 10 characters.")).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("opens approve confirmation, cancels without POST, and confirms with POST", async () => {
    renderWithDeliveries();

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(screen.getByRole("dialog", { name: "Approve and release payment?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/deliveries/delivery-2/approve", { method: "POST" }));
    expect(push).toHaveBeenCalledWith("/jobs/job-1/complete");
  });
});
