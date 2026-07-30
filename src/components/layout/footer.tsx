import type { Route } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";

const primaryLinks: { href: Route; label: string }[] = [
  { href: "/about" as Route, label: "Methodology" },
  { href: "/docs" as Route, label: "Developer API" },
  { href: "/privacy" as Route, label: "Privacy" },
];

const moreLinks: { href: Route; label: string }[] = [
  { href: "/projection" as Route, label: "Projection" },
  { href: "/investments" as Route, label: "Investments" },
  { href: "/retirement-readiness" as Route, label: "Retirement readiness" },
  { href: "/faq" as Route, label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-[74ch] text-muted text-xs leading-relaxed">
            SimplyCPF is an independent, open-source tool. Not affiliated with
            or endorsed by the CPF Board. Figures are estimates based on
            published rates and the assumptions you enter — not financial
            advice.
          </p>
          <nav aria-label="Footer" className="flex items-center gap-5 text-sm">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-link hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col justify-between gap-4 border-separator border-t pt-6 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <Wordmark size="sm" />
            <nav aria-label="More pages" className="flex flex-wrap gap-4">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted text-xs hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <a
            href="https://github.com/ruchernchong/simplycpf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted text-xs hover:text-foreground"
          >
            GitHub · open source
          </a>
        </div>
      </div>
    </footer>
  );
}
