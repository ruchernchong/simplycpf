import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

describe("Footer", () => {
  it("renders the disclaimer", () => {
    render(<Footer />);

    expect(screen.getByText(/independent, open-source tool/i)).toBeTruthy();
    expect(screen.getByText(/not financial advice/i)).toBeTruthy();
  });

  it("renders the primary links", () => {
    render(<Footer />);

    expect(
      screen.getByText("Methodology").closest("a")?.getAttribute("href"),
    ).toBe("/about");
    expect(
      screen.getByText("Developer API").closest("a")?.getAttribute("href"),
    ).toBe("/docs");
    expect(screen.getByText("Privacy").closest("a")?.getAttribute("href")).toBe(
      "/privacy",
    );
  });

  it("renders links to pages outside the main navigation", () => {
    render(<Footer />);

    for (const label of [
      "Projection",
      "Investments",
      "Retirement readiness",
      "FAQ",
    ]) {
      expect(screen.getByText(label).closest("a")).toBeTruthy();
    }
  });

  it("renders the GitHub link", () => {
    render(<Footer />);

    const github = screen.getByText(/GitHub/i).closest("a");
    expect(github?.getAttribute("href")).toBe(
      "https://github.com/ruchernchong/simplycpf",
    );
    expect(github?.getAttribute("rel")).toContain("noopener");
  });
});
