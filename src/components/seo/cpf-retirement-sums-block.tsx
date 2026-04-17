import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CPF_RETIREMENT_SUMS,
  getRetirementSumsForYear,
} from "@/constants/cpf-retirement-sums";

const CpfRetirementSumsBlock = () => {
  const currentYear = new Date().getFullYear();
  const sums = getRetirementSumsForYear(currentYear);

  // Find next few years with data for projections
  const futureYears = Object.keys(CPF_RETIREMENT_SUMS)
    .map(Number)
    .filter((y) => y > currentYear)
    .slice(0, 3);

  return (
    <section aria-labelledby="cpf-retirement-sums" data-content-block="dataset">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle id="cpf-retirement-sums">
            CPF Retirement Sums ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            The <strong>Retirement Sums</strong> determine how much you need in
            your CPF Retirement Account (RA) for different levels of CPF LIFE
            payouts. These amounts increase yearly to keep pace with inflation
            and longer life expectancy.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">Basic Retirement Sum</p>
              <p className="font-bold text-2xl text-foreground">
                S${sums.brs.toLocaleString()}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Minimum for CPF LIFE. Provides basic monthly payouts for life.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">Full Retirement Sum</p>
              <p className="font-bold text-2xl text-foreground">
                S${sums.frs.toLocaleString()}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                2× BRS. Higher monthly payouts for a more comfortable
                retirement.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">
                Enhanced Retirement Sum
              </p>
              <p className="font-bold text-2xl text-foreground">
                S${sums.ers.toLocaleString()}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                3× BRS. Maximum monthly payouts for enhanced retirement income.
              </p>
            </div>
          </div>

          {futureYears.length > 0 && (
            <>
              <p className="font-medium">Retirement Sums for Coming Years:</p>
              <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                {futureYears.map((year) => {
                  const yearSums = getRetirementSumsForYear(year);
                  return (
                    <li key={year}>
                      <strong>{year}:</strong> BRS S$
                      {yearSums.brs.toLocaleString()}, FRS S$
                      {yearSums.frs.toLocaleString()}, ERS S$
                      {yearSums.ers.toLocaleString()}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="text-muted-foreground text-sm">
            Tip: You can withdraw the amount above your FRS at age 55, or
            transfer it to RA for higher CPF LIFE payouts later.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default CpfRetirementSumsBlock;
