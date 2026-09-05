import { Link, Typography } from "@heroui/react";
import type { Route } from "next";
import { Wordmark } from "@/components/shared/wordmark";

const primaryLinks: { href: Route; label: string }[] = [
  { href: "/about" as Route, label: "Methodology" },
  { href: "/docs" as Route, label: "Developer API" },
  { href: "/privacy" as Route, label: "Privacy" },
];

const moreLinks: { href: Route; label: string }[] = [
  { href: "/cpf-at-55", label: "At 55" },
  { href: "/cpf-life", label: "CPF LIFE" },
  { href: "/what-if", label: "Compare" },
  { href: "/interest-rates", label: "Rates" },
  { href: "/cpf-cheat-sheet", label: "Cheat sheet" },
  { href: "/cpf-check", label: "CPF check" },
  { href: "/projection" as Route, label: "Projection" },
  { href: "/investments" as Route, label: "Investments" },
  { href: "/retirement-readiness" as Route, label: "Retirement readiness" },
  { href: "/faq" as Route, label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="site-container mx-auto flex flex-col gap-6 py-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-[74ch]">
            <Typography color="muted" type="body-xs">
              SimplyCPF is an independent, open-source tool. Not affiliated with
              or endorsed by the CPF Board. Figures are estimates based on
              published rates and the assumptions you enter, not financial
              advice.
            </Typography>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-4 text-sm">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col justify-between gap-4 border-separator border-t py-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-6">
            <Wordmark size="sm" />
            <nav aria-label="More pages" className="flex flex-wrap gap-4">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  className="text-muted text-xs"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            className="text-muted text-xs"
            href="https://github.com/ruchernchong/simplycpf"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub · open source
          </Link>
        </div>
      </div>
    </footer>
  );
}
