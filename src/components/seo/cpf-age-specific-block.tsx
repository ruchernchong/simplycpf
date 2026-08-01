import { Card, Typography } from "@heroui/react";
import Link from "next/link";
import { CPF_POLICY_CATALOGUE } from "@/policy";
import type { AgeGroup } from "@/types";

interface CpfAgeSpecificBlockProps {
  ageGroup: AgeGroup;
  exactAge: number;
}

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

function CpfAgeSpecificBlock({ ageGroup, exactAge }: CpfAgeSpecificBlockProps) {
  const employeeRate = ageGroup.contributionRate.employee;
  const employerRate = ageGroup.contributionRate.employer;
  const totalRate = employeeRate + employerRate;
  const usesRetirementAccount =
    exactAge >=
    CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
  const retirementAccount = usesRetirementAccount ? "RA" : "SA";
  const retirementRate =
    (usesRetirementAccount
      ? ageGroup.distributionRate.RA
      : ageGroup.distributionRate.SA) ??
    ageGroup.distributionRate.RA ??
    ageGroup.distributionRate.SA ??
    0;

  // Extract a representative age from the age group for the projection link
  const representativeAge = (ageGroup.minAgeExclusive ?? 25) + 5;
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
            <div className="rounded-2xl bg-surface-secondary p-4">
              <Typography className="mb-1" color="muted" type="body-sm">
                Employee Rate
              </Typography>
              <Typography type="h3" weight="bold">
                {fmtPct(employeeRate)}
              </Typography>
            </div>
            <div className="rounded-2xl bg-surface-secondary p-4">
              <Typography className="mb-1" color="muted" type="body-sm">
                Employer Rate
              </Typography>
              <Typography type="h3" weight="bold">
                {fmtPct(employerRate)}
              </Typography>
            </div>
            <div className="rounded-2xl bg-accent/10 p-4">
              <Typography className="mb-1 text-accent" type="body-sm">
                Total Rate
              </Typography>
              <Typography className="text-accent" type="h3" weight="bold">
                {fmtPct(totalRate)}
              </Typography>
            </div>
          </div>

          <div>
            <Typography className="mb-3" type="h6">
              OA/{retirementAccount}/MA Distribution
            </Typography>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <Typography color="muted" type="body-xs">
                  OA
                </Typography>
                <Typography weight="medium">
                  {fmtPct(ageGroup.distributionRate.OA)}
                </Typography>
                <Typography color="muted" type="body-xs">
                  of contributions
                </Typography>
              </div>
              <div className="flex flex-col gap-1">
                <Typography color="muted" type="body-xs">
                  {retirementAccount}
                </Typography>
                <Typography weight="medium">
                  {fmtPct(retirementRate)}
                </Typography>
                <Typography color="muted" type="body-xs">
                  of contributions
                </Typography>
              </div>
              <div className="flex flex-col gap-1">
                <Typography color="muted" type="body-xs">
                  MA
                </Typography>
                <Typography weight="medium">
                  {fmtPct(ageGroup.distributionRate.MA)}
                </Typography>
                <Typography color="muted" type="body-xs">
                  of contributions
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <Typography weight="medium">
                See Your Long-Term Projection
              </Typography>
              <Typography color="muted" type="body-sm">
                Project your CPF balances through retirement based on these
                rates
              </Typography>
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
}

export default CpfAgeSpecificBlock;
