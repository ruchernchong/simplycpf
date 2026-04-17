import { FavouriteIcon, Github01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-border border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-4">
              <Logo className="size-8 shadow-sm" />
              <span className="font-semibold text-lg">SimplyCPF</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A free, open-source CPF calculator for Singapore. No sign-up, no
              data collection — just accurate numbers backed by CPF Board rates
              that anyone can verify.
            </p>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Disclaimer</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This calculator is an independent tool and is not affiliated with,
              endorsed by, or connected to the CPF Board or Ministry of
              Manpower.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/calculator"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  Calculator
                </Link>
              </li>
              <li>
                <Link
                  href={"/projection" as Route}
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  Projection
                </Link>
              </li>
              <li>
                <Link
                  href={"/what-if" as Route}
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  What-If
                </Link>
              </li>
              <li>
                <Link
                  href={"/cpf-life" as Route}
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  CPF LIFE
                </Link>
              </li>
              <li>
                <Link
                  href="/interest-rates"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  Interest Rates
                </Link>
              </li>
              <li>
                <Link
                  href="/investments"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  Investments
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">
              Official Resources
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="https://www.cpf.gov.sg"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CPF Board Website
                </a>
              </li>
              <li>
                <a
                  href="https://www.mom.gov.sg"
                  className="text-muted-foreground text-sm transition-colors hover:text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ministry of Manpower
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-border border-t py-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SimplyCPF. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ruchernchong/simplycpf"
              className="text-muted-foreground transition-colors hover:text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon
                icon={Github01Icon}
                className="size-5"
                strokeWidth={2}
              />
              <span className="sr-only">GitHub</span>
            </a>
            <span className="flex items-center gap-2 text-muted-foreground text-sm">
              Open-source with
              <HugeiconsIcon
                icon={FavouriteIcon}
                className="size-4 text-accent"
                strokeWidth={2}
              />
              in Singapore
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
