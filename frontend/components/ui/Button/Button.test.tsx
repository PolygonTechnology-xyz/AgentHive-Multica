import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a button by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("defaults type to button", () => {
    render(<Button>X</Button>);
    expect(screen.getByRole("button", { name: "X" })).toHaveAttribute("type", "button");
  });

  it("respects explicit type override", () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("type", "submit");
  });

  it("fires click handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a link when href is provided", () => {
    render(<Button href="/login">Login</Button>);
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  it.each(["primary", "secondary", "ghost"] as const)("supports %s variant", (variant) => {
    render(<Button variant={variant}>v</Button>);
    expect(screen.getByRole("button", { name: "v" })).toBeInTheDocument();
  });

  it("supports variant on link form", () => {
    render(<Button href="/h" variant="ghost">L</Button>);
    expect(screen.getByRole("link", { name: "L" })).toHaveAttribute("href", "/h");
  });

  it("appends custom className on button", () => {
    render(<Button className="my-class">x</Button>);
    expect(screen.getByRole("button", { name: "x" }).className).toContain("my-class");
  });

  it("appends custom className on link", () => {
    render(<Button href="/p" className="my-class">x</Button>);
    expect(screen.getByRole("link", { name: "x" }).className).toContain("my-class");
  });
});
