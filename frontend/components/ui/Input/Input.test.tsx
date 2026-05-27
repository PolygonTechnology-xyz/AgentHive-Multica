import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="email" />);
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
  });

  it("renders a label when label prop provided", () => {
    render(<Input id="x" label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("does not render label span when not provided", () => {
    const { container } = render(<Input id="y" />);
    expect(container.querySelectorAll("span").length).toBe(0);
  });

  it("renders an error message with aria-describedby when id provided", () => {
    render(<Input id="e" error="bad" />);
    const input = screen.getByDisplayValue("");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "e-error");
    expect(screen.getByText("bad")).toHaveAttribute("id", "e-error");
  });

  it("does not set aria-describedby without an id", () => {
    render(<Input error="bad" />);
    const input = screen.getByText("bad").previousSibling as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("fires onChange handler", () => {
    const onChange = vi.fn();
    render(<Input placeholder="p" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("p"), { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalled();
  });
});
