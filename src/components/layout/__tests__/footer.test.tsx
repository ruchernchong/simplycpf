import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Footer } from "../footer";

// Mock the current year to make tests deterministic
const _mockDate = new Date(2024, 0, 1);
const originalDate = global.Date;

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
  Github01Icon: "Github01Icon",
  FavouriteIcon: "FavouriteIcon",
}));

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
    expect(
      screen.getByText(/This calculator is an independent tool/),
    ).toBeTruthy();
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

    const cpfLink = screen.getByText("CPF Board Website");
    expect(cpfLink).toBeTruthy();
    expect(cpfLink.closest("a")?.getAttribute("href")).toBe(
      "https://www.cpf.gov.sg",
    );
    expect(cpfLink.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(cpfLink.closest("a")?.getAttribute("rel")).toBe(
      "noopener noreferrer",
    );

    const momLink = screen.getByText("Ministry of Manpower");
    expect(momLink).toBeTruthy();
    expect(momLink.closest("a")?.getAttribute("href")).toBe(
      "https://www.mom.gov.sg",
    );
  });

  it("displays the current year in copyright text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2024 SimplyCPF. All rights reserved./),
    ).toBeTruthy();
  });

  it("renders 'Open-source with love' text", () => {
    render(<Footer />);
    expect(
      screen.getByText((_, element) => {
        return (
          element?.tagName === "SPAN" &&
          element?.textContent?.includes("Open-source with") &&
          element?.textContent?.includes("in Singapore")
        );
      }),
    ).toBeTruthy();
  });
});
