import type { Route } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

const headingClass =
  "mb-3 font-bold text-foreground text-[11px] uppercase tracking-[0.1em]";
const linkClass =
  "text-muted-foreground text-[13px] transition-colors hover:text-accent";

export function Footer() {
  return (
    <footer className="border-border border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <Logo className="size-6 shadow-sm" />
              <span className="font-bold text-sm">SimplyCPF</span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-[1.55]">
              Open-source CPF calculation reference for Singapore salary
              contribution estimates.
            </p>
          </div>

          <div>
            <h3 className={headingClass}>Disclaimer</h3>
            <p className="text-[12px] text-muted-foreground leading-[1.55]">
              Estimates only. Not official CPF Board figures. Always verify on
              cpf.gov.sg before making financial decisions.
            </p>
          </div>

          <div>
            <h3 className={headingClass}>Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/calculator" className={linkClass}>
                  Calculator
                </Link>
              </li>
              <li>
                <Link href={"/projection" as Route} className={linkClass}>
                  Projection
                </Link>
              </li>
              <li>
                <Link href={"/cpf-life" as Route} className={linkClass}>
                  CPF LIFE
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Official Resources</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="https://www.cpf.gov.sg"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CPF Board
                </a>
              </li>
              <li>
                <a
                  href="https://www.mof.gov.sg/budget-archives/budget-2023/"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Budget 2023
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ruchernchong/simplycpf"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-border border-t py-4 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SimplyCPF. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">Made in Singapore</p>
        </div>
      </div>
    </footer>
  );
}
