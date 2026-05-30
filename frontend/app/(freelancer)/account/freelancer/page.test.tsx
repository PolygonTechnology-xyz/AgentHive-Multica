import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import FreelancerAccountPage from "./page";
import { ApiError } from "@/lib/api";

const mockState = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  mutate: vi.fn(),
  profile: {
    id: "user-1",
    email: "ada@example.com",
    displayName: "Ada Lovelace",
    handle: "ada-lovelace",
    bio: "Analytical engine specialist",
    skills: ["React", "TypeScript"],
    photoUrl: null,
  },
}));

vi.mock("@/hooks/useFetch", () => ({
  useFetch: () => ({ data: { data: mockState.profile }, isLoading: false, mutate: mockState.mutate }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiFetch: mockState.apiFetch };
});

describe("FreelancerAccountPage", () => {
  beforeEach(() => {
    mockState.apiFetch.mockReset();
    mockState.mutate.mockReset();
  });

  test("validates profile fields before saving", async () => {
    render(<FreelancerAccountPage />);

    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/handle/i), { target: { value: "Bad Handle" } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: "x".repeat(501) } });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/display name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/use 3-32 lowercase letters/i)).toBeInTheDocument();
    expect(screen.getByText(/bio must be 500 characters or less/i)).toBeInTheDocument();
    expect(mockState.apiFetch).not.toHaveBeenCalled();
  });

  test("shows handle field error on 409 collision", async () => {
    mockState.apiFetch.mockRejectedValueOnce(new ApiError({ statusCode: 409, error: "HANDLE_TAKEN", message: "taken" }));
    render(<FreelancerAccountPage />);

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/this handle is already taken/i)).toBeInTheDocument();
    expect(mockState.apiFetch).toHaveBeenCalledWith("/users/me", expect.objectContaining({ method: "PATCH" }));
  });

  test("blocks oversized photo upload client-side", async () => {
    render(<FreelancerAccountPage />);

    const file = new File([new Uint8Array(6 * 1024 * 1024)], "large.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/upload profile photo/i), { target: { files: [file] } });

    expect(await screen.findByText("Max 5 MB")).toBeInTheDocument();
    expect(mockState.apiFetch).not.toHaveBeenCalled();
  });

  test("uploads accepted photo and renders returned image", async () => {
    mockState.apiFetch.mockResolvedValueOnce({ data: { photoUrl: "https://cdn.example.com/avatar.png" } });
    render(<FreelancerAccountPage />);

    const file = new File(["image"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/upload profile photo/i), { target: { files: [file] } });

    await waitFor(() => expect(mockState.apiFetch).toHaveBeenCalledWith("/users/me/photo", expect.objectContaining({ method: "POST", body: expect.any(FormData) })));
    expect(await screen.findByRole("status")).toHaveTextContent(/photo uploaded/i);
    expect(document.querySelector('img[src="https://cdn.example.com/avatar.png"]')).toBeInTheDocument();
  });
});
