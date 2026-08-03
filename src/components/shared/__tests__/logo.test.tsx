import { render, screen } from "@testing-library/react";
import { Logo } from "../logo";

describe("Logo", () => {
  it("should render mark variant by default", () => {
    render(<Logo />);
    const svg = screen.getByLabelText(/simplycpf logo/i);
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("viewBox")).toBe("0 0 32 32");
  });

  it("should render mark variant when specified", () => {
    render(<Logo variant="mark" />);
    const svg = screen.getByLabelText(/simplycpf logo/i);
    expect(svg.getAttribute("viewBox")).toBe("0 0 32 32");
  });

  it("should render full variant with text", () => {
    render(<Logo variant="full" />);
    const svg = screen.getByLabelText(/simplycpf logo/i);
    expect(svg.getAttribute("viewBox")).toBe("0 0 180 32");
    expect(screen.getByText("SimplyCPF")).toBeTruthy();
  });

  it("should apply custom className", () => {
    render(<Logo className="custom-class" />);
    const svg = screen.getByLabelText(/simplycpf logo/i);
    expect(svg.classList.contains("custom-class")).toBe(true);
  });
});
