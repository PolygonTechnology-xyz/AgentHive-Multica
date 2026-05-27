import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoutePlaceholder } from "./RoutePlaceholder";

describe("RoutePlaceholder", () => {
  it("renders eyebrow, title and description", () => {
    render(<RoutePlaceholder eyebrow="EYE" title="Welcome" description="Body" />);
    expect(screen.getByText("EYE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("does not render tag list when tags omitted", () => {
    const { container } = render(<RoutePlaceholder eyebrow="e" title="t" description="d" />);
    // Badges render as <span>; no badges present
    expect(container.querySelectorAll("span").length).toBe(0);
  });

  it("renders each tag as a badge when tags provided", () => {
    render(<RoutePlaceholder eyebrow="e" title="t" description="d" tags={["alpha", "beta"]} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
  });
});
