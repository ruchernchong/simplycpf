import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CpfTopUpLimitsBlock = () => {
  const currentYear = new Date().getFullYear();
  const msssAmount = currentYear >= 2025 ? 8000 : 7000;

  return (
    <section
      aria-labelledby="cpf-top-up-limits"
      data-content-block="definition"
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle id="cpf-top-up-limits">
            CPF Top-Up Limits & Tax Relief
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            You can boost your CPF savings through cash top-ups, which also
            qualify for <strong>tax relief</strong>. This is one of the most
            tax-efficient ways to save for retirement in Singapore.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">
                Top-Up to Your Own Account
              </p>
              <p className="font-bold text-2xl text-foreground">
                Up to S${msssAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Cash top-up to your SA (under 55) or RA (55+) qualifies for tax
                relief
              </p>
              <p className="mt-2 text-accent text-xs">
                Tax relief cap: S${msssAmount.toLocaleString()} per calendar
                year
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">
                Top-Up for Family Members
              </p>
              <p className="font-bold text-2xl text-foreground">
                Up to S${msssAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Top-up parents, parents-in-law, grandparents, spouse, or
                siblings
              </p>
              <p className="mt-2 text-accent text-xs">
                Separate S${msssAmount.toLocaleString()} cap for family top-ups
              </p>
            </div>
          </div>

          <p>
            <strong>Matrimonial Retirement Sum Scheme (MRSS):</strong>
          </p>
          <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
            <li>
              Couples can combine their top-ups, with the spouse receiving the
              tax relief
            </li>
            <li>
              Maximum combined relief per couple: S$
              {(msssAmount * 2).toLocaleString()} per year (S$
              {msssAmount.toLocaleString()} each)
            </li>
            <li>
              The recipient must have income not exceeding S$4,000 in the
              previous year
            </li>
          </ul>

          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> Top-ups are irreversible. Once you transfer
            cash to CPF, it stays in CPF until retirement age (or for approved
            housing/education/insurance purposes from OA only).
          </p>

          <p className="text-muted-foreground text-sm">
            <strong>Strategy tip:</strong> Top-ups early in the year maximise
            compound interest. A S${msssAmount.toLocaleString()} top-up to SA at
            age 30 could grow to approximately S$
            {(msssAmount * 2.5).toLocaleString()} by age 55 at 4% per annum.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default CpfTopUpLimitsBlock;
