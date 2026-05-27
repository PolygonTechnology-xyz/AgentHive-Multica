import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders a status element with default label", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "Loading");
  });

  it("renders with a custom aria-label", () => {
    render(<Spinner label="Fetching" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Fetching");
  });
});
