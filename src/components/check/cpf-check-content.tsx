"use client";

import {
  Card,
  Checkbox,
  cn,
  Description,
  Link,
  Separator,
  Surface,
  Typography,
} from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { PageHeader } from "@/components/shared/section-header";
import { CPF_POLICY_CATALOGUE } from "@/policy";

const lifecycle = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
const employment = CPF_POLICY_CATALOGUE.rules.statutoryEmploymentAges;
const escalatingPlan = CPF_POLICY_CATALOGUE.cpfLife.plans.escalating;

const PAGE_HEADER = {
  eyebrow: "Check",
  title: "Five things worth knowing. Which do you already?",
  lede: "A SimplyCPF self-check, not a CPF Board assessment. There is no score or right answer: tick what you know and we will point you to an explanation for each of the rest. Nothing is recorded and no email is asked for.",
} as const;

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
    title: `I know what happens to my accounts on my ${lifecycle.retirementAccountCreated}th birthday`,
    body: "A Retirement Account is created, the Special Account closes, and savings move in a set order.",
    href: "/cpf-at-55",
    linkLabel: `What happens at ${lifecycle.retirementAccountCreated}`,
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
    body: `Standard stays steady, Escalating rises ${escalatingPlan.annualIncreasePercent}% a year from a lower start, and Basic can progressively decrease.`,
    href: "/cpf-life",
    linkLabel: "CPF LIFE, the three plans",
  },
  {
    id: "three-ages",
    title: "I know my retirement age and my payout age are different numbers",
    body: `The published statutory retirement age is ${employment.retirementAge} from ${employment.effectiveDate}, while CPF payout eligibility starts at ${lifecycle.cpfLifePayoutEligibility}.`,
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
        <Card.Content className="flex flex-col gap-2">
          <Checkbox.Content className="flex items-start gap-4">
            <Checkbox.Control className="shrink-0">
              <Checkbox.Indicator />
            </Checkbox.Control>
            {item.title}
          </Checkbox.Content>
          <Description className="max-w-[64ch] pl-8">{item.body}</Description>
        </Card.Content>
      </Card>
    </Checkbox>
  );
}

function PointerRow({ item }: { item: CheckItem }): ReactNode {
  return (
    <Link className="block w-full" href={item.href}>
      <Surface
        className="flex items-center justify-between gap-4 rounded-2xl p-4"
        variant="tertiary"
      >
        <Typography type="body-sm">{item.linkLabel}</Typography>
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
      <PageHeader {...PAGE_HEADER} />

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
            <Typography color="muted" type="body-xs">
              Where to read the rest
            </Typography>
            <Typography>
              {allTicked
                ? "All five ticked. Nothing left to point you at, the screens are still there if you want the numbers for your own salary."
                : `You have ticked ${tickedIds.length} of five. Here is where each of the others is explained, in your own numbers.`}
            </Typography>
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
              <Typography color="muted" type="body-xs">
                This SimplyCPF editorial checklist does not assess your
                retirement readiness or represent CPF Board guidance. It only
                shows which explanation you have not read yet.
              </Typography>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
