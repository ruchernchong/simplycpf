import { Card } from "@heroui/react";
import Link from "next/link";
import { formatPercentage } from "@/lib/format";
import type { AgeGroup } from "@/types";

interface CpfAgeSpecificBlockProps {
  ageGroup: AgeGroup;
}

const CpfAgeSpecificBlock = ({ ageGroup }: CpfAgeSpecificBlockProps) => {
  const employeeRate = ageGroup.contributionRate.employee;
  const employerRate = ageGroup.contributionRate.employer;
  const totalRate = employeeRate + employerRate;

  // Extract a representative age from the age group for the projection link
  const representativeAge = ageGroup.minAge + 5;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - representativeAge;
  const birthDate = `${birthYear}-01-01`;

  return (
    <section
      aria-labelledby={`age-group-${ageGroup.description.replace(/\s+/g, "-").toLowerCase()}`}
      data-content-block="age-specific"
    >
      <Card>
        <Card.Header>
          <Card.Title
            id={`age-group-${ageGroup.description.replace(/\s+/g, "-").toLowerCase()}`}
          >
            CPF Contribution Rates for {ageGroup.description}
          </Card.Title>
          <Card.Description>
            Contribution and distribution rates for employees{" "}
            {ageGroup.description.toLowerCase()}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-surface-tertiary p-4">
              <p className="mb-1 text-muted text-sm">Employee Rate</p>
              <p className="font-bold font-mono text-2xl text-foreground">
                {formatPercentage(employeeRate, { decimalPlaces: 1 })}
              </p>
            </div>
            <div className="rounded-lg bg-surface-tertiary p-4">
              <p className="mb-1 text-muted text-sm">Employer Rate</p>
              <p className="font-bold font-mono text-2xl text-foreground">
                {formatPercentage(employerRate, { decimalPlaces: 1 })}
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-4">
              <p className="mb-1 text-accent-foreground text-sm">Total Rate</p>
              <p className="font-bold font-mono text-2xl text-accent">
                {formatPercentage(totalRate, { decimalPlaces: 1 })}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-sm">
              OA/SA/MA Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-muted text-xs">OA</span>
                <span className="font-medium font-mono">
                  {formatPercentage(ageGroup.distributionRate.OA, {
                    decimalPlaces: 1,
                  })}
                </span>
                <span className="text-muted text-xs">of contributions</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted text-xs">SA</span>
                <span className="font-medium font-mono">
                  {formatPercentage(ageGroup.distributionRate.SA, {
                    decimalPlaces: 1,
                  })}
                </span>
                <span className="text-muted text-xs">of contributions</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted text-xs">MA</span>
                <span className="font-medium font-mono">
                  {formatPercentage(ageGroup.distributionRate.MA, {
                    decimalPlaces: 1,
                  })}
                </span>
                <span className="text-muted text-xs">of contributions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">See Your Long-Term Projection</p>
              <p className="text-muted text-sm">
                Project your CPF balances through retirement based on these
                rates
              </p>
            </div>
            <Link
              href={`/projection?birthDate=${birthDate}`}
              className="inline-flex h-9 items-center justify-center rounded-4xl bg-foreground px-4 font-medium text-background text-sm transition-colors hover:bg-foreground/80"
            >
              View Projection
            </Link>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
};

export default CpfAgeSpecificBlock;
