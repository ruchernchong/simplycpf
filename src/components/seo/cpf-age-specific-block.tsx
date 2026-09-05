import { buttonVariants, Card, cn, Link, Surface } from "@heroui/react";
import { KPI } from "@heroui-pro/react/kpi";
import { formatPercentage } from "@/lib/format";
import type { AgeGroup } from "@/types";

interface CpfAgeSpecificBlockProps {
  ageGroup: AgeGroup;
}

function CpfAgeSpecificBlock({ ageGroup }: CpfAgeSpecificBlockProps) {
  const employeeRate = ageGroup.contributionRate.employee;
  const employerRate = ageGroup.contributionRate.employer;
  const totalRate = employeeRate + employerRate;

  // Extract a representative age from the age group for the projection link
  const representativeAge = ageGroup.minAge + 5;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - representativeAge;
  const birthDate = `${birthYear}-01-01`;

  const rateTiles = [
    {
      label: "Employee Rate",
      value: employeeRate,
      accent: false,
    },
    {
      label: "Employer Rate",
      value: employerRate,
      accent: false,
    },
    {
      label: "Total Rate",
      value: totalRate,
      accent: true,
    },
  ];

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
            {rateTiles.map((tile) => (
              <KPI
                className={cn(
                  "gap-2",
                  tile.accent && "border-accent/25 bg-accent/10",
                )}
                key={tile.label}
              >
                <KPI.Header>
                  <KPI.Title
                    className={cn(
                      "text-sm",
                      tile.accent ? "text-accent-foreground" : "text-muted",
                    )}
                  >
                    {tile.label}
                  </KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    className={cn(
                      "font-bold font-mono text-2xl",
                      tile.accent ? "text-accent" : "text-foreground",
                    )}
                    locale="en-SG"
                    maximumFractionDigits={1}
                    style="percent"
                    value={tile.value}
                  />
                </KPI.Content>
              </KPI>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-sm">OA/SA/MA Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  ["OA", ageGroup.distributionRate.OA],
                  ["SA", ageGroup.distributionRate.SA],
                  ["MA", ageGroup.distributionRate.MA],
                ] as const
              ).map(([label, rate]) => (
                <div className="flex flex-col gap-2" key={label}>
                  <span className="text-muted text-xs">{label}</span>
                  <span className="font-medium font-mono">
                    {formatPercentage(rate, { decimalPlaces: 1 })}
                  </span>
                  <span className="text-muted text-xs">of contributions</span>
                </div>
              ))}
            </div>
          </div>

          <Surface
            className="flex flex-col items-start justify-between gap-4 rounded-lg p-4 sm:flex-row sm:items-center"
            variant="secondary"
          >
            <div className="flex flex-col gap-2">
              <p className="font-medium">See Your Long-Term Projection</p>
              <p className="text-muted text-sm">
                Project your CPF balances through retirement based on these
                rates
              </p>
            </div>
            <Link
              className={cn(buttonVariants({ size: "md" }), "shrink-0")}
              href={`/projection?birthDate=${birthDate}`}
            >
              View Projection
            </Link>
          </Surface>
        </Card.Content>
      </Card>
    </section>
  );
}

export default CpfAgeSpecificBlock;
