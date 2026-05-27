import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its content", () => {
    render(<Card>Glass panel</Card>);
    expect(screen.getByText("Glass panel")).toBeInTheDocument();
  });

  it("appends custom className", () => {
    render(<Card className="extra">x</Card>);
    expect(screen.getByText("x").className).toContain("extra");
  });

  it("renders without className", () => {
    render(<Card>y</Card>);
    expect(screen.getByText("y")).toBeInTheDocument();
  });

  it("forwards arbitrary props onto the div", () => {
    render(<Card data-testid="card-el">z</Card>);
    expect(screen.getByTestId("card-el")).toBeInTheDocument();
  });
});
