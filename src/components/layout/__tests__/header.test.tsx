import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Header } from "../header";

vi.mock("@hugeicons/react", () => ({
  HugeiconsIcon: ({
    icon,
    ...props
  }: {
    icon: unknown;
    "data-testid"?: string;
  }) => <div data-testid={props["data-testid"] || "hugeicon"}>Icon</div>,
}));

vi.mock("@hugeicons/core-free-icons", () => ({
  CodeIcon: "CodeIcon",
  Home01Icon: "Home01Icon",
  InformationCircleIcon: "InformationCircleIcon",
}));

vi.mock("@/components/layout/mobile-nav", () => ({
  default: () => <div data-testid="mobile-nav">MobileNav</div>,
}));

vi.mock("@/components/layout/theme-toggle", () => ({
  default: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe("Header", () => {
  it("renders the logo with link to homepage", () => {
    render(<Header />);

    const logoLink = screen.getByText("SimplyCPF");
    expect(logoLink).toBeTruthy();
    expect(logoLink.closest("a")?.getAttribute("href")).toBe("/");
  });

  it("renders navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
  });

  it("renders the mobile nav", () => {
    render(<Header />);

    expect(screen.getByTestId("mobile-nav")).toBeTruthy();
  });

  it("renders the theme toggle", () => {
    render(<Header />);

    expect(screen.getByTestId("theme-toggle")).toBeTruthy();
  });

  it("renders skip-to-content link", () => {
    render(<Header />);

    expect(screen.getByText("Skip to content")).toBeTruthy();
  });
});
