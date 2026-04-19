import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

const originalDate = global.Date;

describe("Footer", () => {
  beforeAll(() => {
    // @ts-expect-error
    global.Date = class extends Date {
      getFullYear() {
        return 2024;
      }
    };
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  it("renders disclaimer section", () => {
    render(<Footer />);
    expect(screen.getByText("Disclaimer")).toBeTruthy();
    expect(screen.getByText(/Not official CPF Board figures/)).toBeTruthy();
  });

  it("renders quick links section with correct links", () => {
    render(<Footer />);
    expect(screen.getByText("Quick Links")).toBeTruthy();

    const aboutLink = screen.getByText("About");
    expect(aboutLink).toBeTruthy();
    expect(aboutLink.closest("a")?.getAttribute("href")).toBe("/about");
  });

  it("renders resources section with external links", () => {
    render(<Footer />);
    expect(screen.getByText("Official Resources")).toBeTruthy();

    const cpfLink = screen.getByText("CPF Board");
    expect(cpfLink).toBeTruthy();
    expect(cpfLink.closest("a")?.getAttribute("href")).toBe(
      "https://www.cpf.gov.sg",
    );
    expect(cpfLink.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(cpfLink.closest("a")?.getAttribute("rel")).toBe(
      "noopener noreferrer",
    );

    const budgetLink = screen.getByText("Budget 2023");
    expect(budgetLink).toBeTruthy();
    expect(budgetLink.closest("a")?.getAttribute("href")).toBe(
      "https://www.mof.gov.sg/budget-archives/budget-2023/",
    );

    const githubLink = screen.getByText("GitHub Repository");
    expect(githubLink).toBeTruthy();
    expect(githubLink.closest("a")?.getAttribute("href")).toBe(
      "https://github.com/ruchernchong/simplycpf",
    );
  });

  it("displays the current year in copyright text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2024 SimplyCPF. All rights reserved./),
    ).toBeTruthy();
  });

  it("renders 'Made in Singapore' tagline", () => {
    render(<Footer />);
    expect(screen.getByText("Made in Singapore")).toBeTruthy();
  });
});
