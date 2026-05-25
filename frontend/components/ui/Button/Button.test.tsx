import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a button by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders a link when href is provided", () => {
    render(<Button href="/login">Login</Button>);
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });
});
