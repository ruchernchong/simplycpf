import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Header } from "../header";

const push = vi.fn();

vi.mock("@heroui-pro/react", () => {
  function Segment({ children }: { children: React.ReactNode }) {
    return <div role="radiogroup">{children}</div>;
  }
  Segment.Item = function SegmentItem({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <button type="button">{children}</button>;
  };
  return { Segment };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push }),
}));

vi.mock("@/components/layout/theme-toggle", () => ({
  default: function ThemeToggleMock() {
    return <div data-testid="theme-toggle">ThemeToggle</div>;
  },
}));

vi.mock("@/hooks/use-cpf-store", () => ({
  useCpfStore: (selector: (state: unknown) => unknown) =>
    selector({
      settings: {
        shouldStoreInput: false,
        monthlyGrossIncome: 0,
        birthDate: "",
        citizenshipStatus: "citizen",
      },
      latestIncomeCeilingDate: "2026-01-01",
    }),
}));

describe("Header", () => {
  it("renders the wordmark linking to the homepage", () => {
    render(<Header />);

    const wordmark = screen.getByText("SimplyCPF");
    expect(wordmark).toBeTruthy();
    expect(wordmark.closest("a")?.getAttribute("href")).toBe("/");
  });

  it("renders all nine navigation tabs", () => {
    render(<Header />);

    for (const label of [
      "Home",
      "This month",
      "At 55",
      "Home & OA",
      "CPF LIFE",
      "Compare",
      "Rates",
      "Cheat sheet",
      "Check",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("renders the theme toggle", () => {
    render(<Header />);

    expect(screen.getByTestId("theme-toggle")).toBeTruthy();
  });

  it("renders a skip-to-content link", () => {
    render(<Header />);

    const skipLink = screen.getByText("Skip to content");
    expect(skipLink.getAttribute("href")).toBe("#main-content");
  });
});
