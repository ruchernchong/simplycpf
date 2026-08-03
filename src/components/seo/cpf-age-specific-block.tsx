import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgeGroup } from "@/types";

interface CpfAgeSpecificBlockProps {
  ageGroup: AgeGroup;
}

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle
            id={`age-group-${ageGroup.description.replace(/\s+/g, "-").toLowerCase()}`}
          >
            CPF Contribution Rates for {ageGroup.description}
          </CardTitle>
          <CardDescription>
            Contribution and distribution rates for employees{" "}
            {ageGroup.description.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-1 text-muted-foreground text-sm">
                Employee Rate
              </p>
              <p className="font-bold font-mono text-2xl text-foreground">
                {fmtPct(employeeRate)}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-1 text-muted-foreground text-sm">
                Employer Rate
              </p>
              <p className="font-bold font-mono text-2xl text-foreground">
                {fmtPct(employerRate)}
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-4">
              <p className="mb-1 text-accent-foreground text-sm">Total Rate</p>
              <p className="font-bold font-mono text-2xl text-accent">
                {fmtPct(totalRate)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-sm">
              OA/SA/MA Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">OA</span>
                <span className="font-medium font-mono">
                  {fmtPct(ageGroup.distributionRate.OA)}
                </span>
                <span className="text-muted-foreground text-xs">
                  of contributions
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">SA</span>
                <span className="font-medium font-mono">
                  {fmtPct(ageGroup.distributionRate.SA)}
                </span>
                <span className="text-muted-foreground text-xs">
                  of contributions
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">MA</span>
                <span className="font-medium font-mono">
                  {fmtPct(ageGroup.distributionRate.MA)}
                </span>
                <span className="text-muted-foreground text-xs">
                  of contributions
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">See Your Long-Term Projection</p>
              <p className="text-muted-foreground text-sm">
                Project your CPF balances through retirement based on these
                rates
              </p>
            </div>
            <Link
              href={`/projection?birthDate=${birthDate}`}
              className="inline-flex h-9 items-center justify-center rounded-4xl bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/80"
            >
              View Projection
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CpfAgeSpecificBlock;
