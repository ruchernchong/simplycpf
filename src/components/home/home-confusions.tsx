import { Card, Typography } from "@heroui/react";
import type { Route } from "next";
import Link from "next/link";

const confusions: {
  eyebrow: string;
  title: string;
  body: string;
  linkLabel: string;
  href: Route;
}[] = [
  {
    eyebrow: "Confusion 01",
    title: "“My Special Account is closing?”",
    body: "SA closed for members 55+ in Jan 2025. See the official SA → RA → OA routing branches.",
    linkLabel: "What happens at 55 →",
    href: "/cpf-at-55" as Route,
  },
  {
    eyebrow: "Confusion 02",
    title: "“Accrued interest? On my own money?”",
    body: "A single OA housing withdrawal accumulates accrued interest at the applicable OA rate; sale proceeds can cap the refund.",
    linkLabel: "Work out the refund →",
    href: "/accrued-interest" as Route,
  },
  {
    eyebrow: "Confusion 03",
    title: "“Which CPF LIFE plan is which?”",
    body: "Three official payout shapes, plus CPF Board's exact 2026 Standard Plan reference rows.",
    linkLabel: "Compare the plans →",
    href: "/cpf-life" as Route,
  },
  {
    eyebrow: "Confusion 04",
    title: "“Why did my January pay drop?”",
    body: "The OW ceiling reached $8,000 in Jan 2026, so more wages can attract both employee and employer contributions.",
    linkLabel: "See both sides →",
    href: "/calculator" as Route,
  },
];

export function HomeConfusions() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Typography type="h6">
          The four things people actually get wrong
        </Typography>
        <Typography color="muted" type="body-xs">
          Each one is a screen, not an article
        </Typography>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {confusions.map((confusion) => (
          <Link key={confusion.eyebrow} className="group" href={confusion.href}>
            <Card className="h-full transition-colors group-hover:border-accent">
              <Card.Header className="flex flex-1 flex-col gap-2">
                <Typography color="muted" type="body-xs">
                  {confusion.eyebrow}
                </Typography>
                <Card.Title className="text-balance">
                  {confusion.title}
                </Card.Title>
                <Card.Description>{confusion.body}</Card.Description>
              </Card.Header>
              <Card.Footer>
                <Typography className="link" type="body-sm">
                  {confusion.linkLabel}
                </Typography>
              </Card.Footer>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
