import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>NEW</Badge>);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("applies className when supplied", () => {
    render(<Badge className="extra">x</Badge>);
    const el = screen.getByText("x");
    expect(el.className).toContain("extra");
  });

  it("renders without a tone class for default accent tone", () => {
    render(<Badge>accent</Badge>);
    // No throw; element present
    expect(screen.getByText("accent")).toBeInTheDocument();
  });

  it.each(["violet", "cyan", "warn"] as const)("renders with %s tone", (tone) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    expect(screen.getByText(tone)).toBeInTheDocument();
  });

  it("forwards arbitrary span props", () => {
    render(<Badge data-testid="b">x</Badge>);
    expect(screen.getByTestId("b")).toBeInTheDocument();
  });
});
