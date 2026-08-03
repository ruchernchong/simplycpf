"use client";

import { Card, Checkbox, cn, Link, Separator, Surface } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";

interface CheckItem {
  id: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}

const CHECK_ITEMS: CheckItem[] = [
  {
    id: "at-55",
    title: "I know what happens to my accounts on my 55th birthday",
    body: "A Retirement Account is created, the Special Account closes, and savings move in a set order.",
    href: "/cpf-at-55",
    linkLabel: "What happens at 55",
  },
  {
    id: "accrued-interest",
    title: "I know OA used for my home keeps accruing interest",
    body: "The principal plus accrued interest returns to CPF when the property is sold.",
    href: "/accrued-interest",
    linkLabel: "Home & OA, accrued interest",
  },
  {
    id: "cpf-life",
    title: "I can tell the three CPF LIFE plans apart",
    body: "Standard stays flat, Escalating rises 2% a year from a lower start, Basic can step down.",
    href: "/cpf-life",
    linkLabel: "CPF LIFE, the three plans",
  },
  {
    id: "three-ages",
    title: "I know my retirement age and my payout age are different numbers",
    body: "Statutory retirement age is 64 from July 2026. Payout eligibility age remains 65.",
    href: "/",
    linkLabel: "Three ages, on the home page",
  },
  {
    id: "employer-share",
    title: "I know how much of my monthly CPF comes from my employer",
    body: "The employer share is paid on top of your salary, not deducted from it.",
    href: "/calculator",
    linkLabel: "This month, your employer's share",
  },
];

interface CheckCardProps {
  item: CheckItem;
  isTicked: boolean;
  onToggle: (ticked: boolean) => void;
}

function CheckCard({ item, isTicked, onToggle }: CheckCardProps): ReactNode {
  return (
    <Checkbox
      className="block w-full"
      isSelected={isTicked}
      onChange={onToggle}
      value={item.id}
    >
      <Card className={cn("w-full", isTicked && "border-accent/40")}>
        <Card.Content>
          <Checkbox.Content className="flex items-start gap-4">
            <Checkbox.Control className="shrink-0">
              <Checkbox.Indicator />
            </Checkbox.Control>
            <span className="flex flex-col gap-2">
              <span className="font-semibold text-base tracking-tight">
                {item.title}
              </span>
              <span className="max-w-[64ch] text-muted text-sm leading-relaxed">
                {item.body}
              </span>
            </span>
          </Checkbox.Content>
        </Card.Content>
      </Card>
    </Checkbox>
  );
}

function PointerRow({ item }: { item: CheckItem }): ReactNode {
  return (
    <Link className="block w-full" href={item.href}>
      <Surface
        className="flex items-center justify-between gap-4 rounded-lg p-4 text-sm"
        variant="tertiary"
      >
        <span>{item.linkLabel}</span>
        <ArrowRight aria-hidden className="size-4 shrink-0 text-accent" />
      </Surface>
    </Link>
  );
}

export default function CpfCheckContent(): ReactNode {
  const [tickedIds, setTickedIds] = useState<string[]>([]);

  const toggle = (id: string, ticked: boolean) =>
    setTickedIds((current) =>
      ticked ? [...current, id] : current.filter((value) => value !== id),
    );

  const untickedItems = CHECK_ITEMS.filter(
    (item) => !tickedIds.includes(item.id),
  );
  const allTicked = untickedItems.length === 0;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[10.5px] text-muted uppercase tracking-[0.13em]">
          Check
        </span>
        <h1 className="text-balance font-semibold text-4xl tracking-tight">
          Five things worth knowing. Which do you already?
        </h1>
        <p className="max-w-[76ch] text-pretty text-base text-muted leading-relaxed">
          Not a score, and no right answer. Tick what you already know and we
          will point you at the screen that explains each of the rest. Nothing
          is recorded and no email is asked for.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {CHECK_ITEMS.map((item) => (
            <CheckCard
              isTicked={tickedIds.includes(item.id)}
              item={item}
              key={item.id}
              onToggle={(ticked) => toggle(item.id, ticked)}
            />
          ))}
        </div>

        <Card className="lg:sticky lg:top-24">
          <Card.Content className="flex flex-col gap-6">
            <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
              Where to read the rest
            </span>
            <p className="text-base leading-relaxed">
              {allTicked
                ? "All five ticked. Nothing left to point you at, the screens are still there if you want the numbers for your own salary."
                : `You have ticked ${tickedIds.length} of five. Here is where each of the others is explained, in your own numbers.`}
            </p>
            {untickedItems.length > 0 && (
              <ul className="flex flex-col gap-2">
                {untickedItems.map((item) => (
                  <li key={item.id}>
                    <PointerRow item={item} />
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-4">
              <Separator variant="secondary" />
              <p className="text-[12px] text-muted leading-relaxed">
                We do not assess your readiness or suggest what to do, this only
                shows which explanation you have not read yet.
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
