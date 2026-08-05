import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Header } from "../header";

const push = vi.fn();

vi.mock("@heroui/react", async () => {
  const actual =
    await vi.importActual<typeof import("@heroui/react")>("@heroui/react");

  return {
    ...actual,
    Button: function ButtonMock({
      children,
      ...props
    }: {
      children: React.ReactNode;
      "aria-label"?: string;
    }) {
      return (
        <button type="button" {...props}>
          {children}
        </button>
      );
    },
    Link: function LinkMock({
      children,
      href,
      className,
      "aria-current": ariaCurrent,
    }: {
      children: React.ReactNode;
      href?: string;
      className?: string;
      "aria-current"?: React.AriaAttributes["aria-current"];
    }) {
      return (
        <a href={href} className={className} aria-current={ariaCurrent}>
          {children}
        </a>
      );
    },
  };
});

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

  function Sheet({ children }: { children: React.ReactNode }) {
    return <div data-testid="mobile-nav-sheet">{children}</div>;
  }
  Sheet.Trigger = function SheetTrigger({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  };
  Sheet.Backdrop = function SheetBackdrop({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  Sheet.Content = function SheetContent({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  Sheet.Dialog = function SheetDialog({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  Sheet.Header = function SheetHeader({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  Sheet.Heading = function SheetHeading({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <h2>{children}</h2>;
  };
  Sheet.Body = function SheetBody({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
  Sheet.CloseTrigger = function SheetCloseTrigger() {
    return <button type="button">Close</button>;
  };

  return { Segment, Sheet };
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

  it("renders the mobile menu trigger", () => {
    render(<Header />);

    expect(screen.getByLabelText("Open menu")).toBeTruthy();
    expect(screen.getByTestId("mobile-nav-sheet")).toBeTruthy();
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
