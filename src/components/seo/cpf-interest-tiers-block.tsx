import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";

const CpfInterestTiersBlock = () => (
  <section aria-labelledby="cpf-interest-tiers" data-content-block="definition">
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle id="cpf-interest-tiers">
          CPF Extra Interest: How the 1% Bonus Works
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>
          CPF members earn <strong>extra interest</strong> on top of base rates
          to boost retirement savings. This bonus interest applies to the first
          portion of your combined CPF balances.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 font-semibold text-sm">Under Age 55</p>
            <p className="font-bold text-2xl text-foreground">
              +{CPF_EXTRA_INTEREST_RATE * 100}%
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              On the first S${CPF_EXTRA_INTEREST_CAP.toLocaleString()} of
              combined OA + SA + MA balances
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Max extra interest: S$
              {(CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE).toFixed(0)}{" "}
              per year
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 font-semibold text-sm">Age 55 and Above</p>
            <p className="font-bold text-2xl text-foreground">
              +{CPF_EXTRA_INTEREST_RATE * 100}% + {CPF_EXTRA_INTEREST_RATE}%
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              First tier: S${CPF_OA_EXTRA_INTEREST_CAP.toLocaleString()}
              <br />
              Second tier: Next S$
              {(
                CPF_EXTRA_INTEREST_CAP - CPF_OA_EXTRA_INTEREST_CAP
              ).toLocaleString()}{" "}
              of OA + SA + MA + RA
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Max extra interest: S$
              {(
                CPF_OA_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE +
                (CPF_EXTRA_INTEREST_CAP - CPF_OA_EXTRA_INTEREST_CAP) *
                  CPF_EXTRA_INTEREST_RATE
              ).toFixed(0)}{" "}
              per year
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          <strong>How it works:</strong> The extra interest is paid into your
          Special Account (or Retirement Account if you{"'"}re 55+). This means
          your SA/RA grows faster, directly increasing your CPF LIFE payouts in
          retirement.
        </p>

        <p className="text-muted-foreground text-sm">
          <strong>Example:</strong> A 30-year-old with S$50,000 across OA + SA +
          MA earns an extra S${(50000 * 0.01).toFixed(0)} per year (S$
          {((50000 * 0.01) / 12).toFixed(0)} per month) on top of base rates.
        </p>
      </CardContent>
    </Card>
  </section>
);

export default CpfInterestTiersBlock;
