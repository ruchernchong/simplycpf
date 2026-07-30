import { Card } from "@heroui/react";
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
    body: "1.4 million SAs closed in Jan 2025. See your own SA → RA → OA split, in dollars.",
    linkLabel: "What happens at 55 →",
    href: "/cpf-at-55" as Route,
  },
  {
    eyebrow: "Confusion 02",
    title: "“Accrued interest? On my own money?”",
    body: "OA used for a flat keeps accruing 2.5%, refundable when you sell.",
    linkLabel: "Work out the refund →",
    href: "/accrued-interest" as Route,
  },
  {
    eyebrow: "Confusion 03",
    title: "“Which CPF LIFE plan is which?”",
    body: "Three payout shapes from one balance. Compared, never ranked.",
    linkLabel: "Compare the plans →",
    href: "/cpf-life" as Route,
  },
  {
    eyebrow: "Confusion 04",
    title: "“Why did my January pay drop?”",
    body: "The ceiling reached $8,000. Less in your bank, more from your employer.",
    linkLabel: "See both sides →",
    href: "/calculator" as Route,
  },
];

export function HomeConfusions() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-semibold text-base tracking-tight">
          The four things people actually get wrong
        </h2>
        <span className="text-muted text-xs">
          Each one is a screen, not an article
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {confusions.map((confusion) => (
          <Link key={confusion.eyebrow} className="group" href={confusion.href}>
            <Card className="h-full transition-colors group-hover:border-accent">
              <Card.Header className="flex flex-1 flex-col gap-2">
                <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                  {confusion.eyebrow}
                </span>
                <Card.Title className="text-balance font-semibold text-[15px]">
                  {confusion.title}
                </Card.Title>
                <Card.Description className="text-[13px] text-muted leading-relaxed">
                  {confusion.body}
                </Card.Description>
              </Card.Header>
              <Card.Footer>
                <span className="link text-[13px]">{confusion.linkLabel}</span>
              </Card.Footer>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
