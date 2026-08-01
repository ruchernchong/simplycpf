import { Card, Link, Typography } from "@heroui/react";
import { formatDate, formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export default function IncomeCeilingDefinitionBlock() {
  const ceilingChanges = CPF_POLICY_CATALOGUE.contributionSchedules.filter(
    (schedule, index, schedules) =>
      index === 0 ||
      schedule.ordinaryWageCeiling !==
        schedules[index - 1]?.ordinaryWageCeiling,
  );
  const first = ceilingChanges.at(0);
  const latest = ceilingChanges.at(-1);
  if (!first || !latest) {
    throw new Error("The CPF Ordinary Wage ceiling timeline is unavailable.");
  }

  return (
    <section
      aria-labelledby="income-ceiling-definition"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="income-ceiling-definition">
            What is the CPF Income Ceiling?
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Typography>
            The <strong>Ordinary Wage ceiling</strong> is the maximum monthly
            Ordinary Wages on which CPF contributions are payable. Wages above
            the applicable ceiling do not attract OW contributions.
          </Typography>
          <Typography>
            The published schedule progresses from{" "}
            <strong>S$${formatNumber(first.ordinaryWageCeiling)}</strong> to{" "}
            <strong>S$${formatNumber(latest.ordinaryWageCeiling)}</strong>:
          </Typography>
          <ul className="flex flex-col gap-2 text-muted">
            {ceilingChanges.map((schedule, index) => {
              const previous = ceilingChanges[index - 1];
              return (
                <li key={schedule.id}>
                  {formatDate(schedule.effectiveFrom, "MMMM yyyy")}:{" "}
                  {previous
                    ? `S$${formatNumber(previous.ordinaryWageCeiling)} → S$${formatNumber(schedule.ordinaryWageCeiling)}`
                    : `S$${formatNumber(schedule.ordinaryWageCeiling)}`}
                </li>
              );
            })}
          </ul>
          <Typography>
            For wages above an earlier ceiling, an increase can reduce
            take-home pay while increasing both employee and employer CPF
            contributions. Additional Wages use a separate annual ceiling and
            require annual OW and prior-AW context.
          </Typography>
          <Link
            href={latest.wageCeilingMetadata.sourceUrls[0]}
            rel="noopener noreferrer"
            target="_blank"
          >
            CPF Board wage-ceiling source
            <Link.Icon aria-hidden="true" />
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
