import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const accounts = [
  {
    code: "OA",
    name: "Ordinary Account",
    description: "Housing, investments, insurance, and education.",
    badgeClass: "bg-chart-1",
  },
  {
    code: "SA",
    name: "Special Account",
    description: "Retirement-related financial instruments and old age.",
    badgeClass: "bg-chart-2",
  },
  {
    code: "MA",
    name: "Medisave Account",
    description: "Hospitalisation, approved medical insurance, and healthcare.",
    badgeClass: "bg-chart-3",
  },
];

const CpfDefinitionBlock = () => (
  <section
    aria-labelledby="cpf-definition"
    data-content-block="definition"
    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
  >
    <div className="flex items-center gap-2">
      <HugeiconsIcon
        icon={BookOpen01Icon}
        className="size-[18px] text-accent"
        strokeWidth={2}
        aria-hidden="true"
      />
      <h2 id="cpf-definition" className="font-semibold text-foreground text-xl">
        What is CPF?
      </h2>
    </div>
    <p className="text-[15px] text-foreground/85 leading-[1.55]">
      The <strong>Central Provident Fund (CPF)</strong> is Singapore&apos;s
      mandatory social security system. Every working Singaporean contributes a
      portion of their monthly salary, matched by their employer, into three
      accounts — each serving a distinct life purpose.
    </p>
    <div className="grid gap-4 md:grid-cols-3">
      {accounts.map((account) => (
        <div
          key={account.code}
          className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex size-7 items-center justify-center rounded-md font-bold text-[10px] text-accent-foreground ${account.badgeClass}`}
              aria-hidden="true"
            >
              {account.code}
            </span>
            <h3 className="font-semibold text-[14px] text-foreground">
              {account.name}
            </h3>
          </div>
          <p className="text-[13px] text-muted-foreground leading-[1.5]">
            {account.description}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default CpfDefinitionBlock;
