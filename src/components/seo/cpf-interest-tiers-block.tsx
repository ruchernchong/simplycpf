import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
} from "@/constants/cpf-interest-tiers";

const CpfInterestTiersBlock = () => (
  <section
    aria-labelledby="cpf-interest-tiers"
    data-content-block="definition"
    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
  >
    <div className="flex flex-col gap-1">
      <h2
        id="cpf-interest-tiers"
        className="font-semibold text-[16px] text-foreground"
      >
        CPF Extra Interest: How the 1% Bonus Works
      </h2>
      <p className="text-[12px] text-muted-foreground">
        CPF members earn extra interest on top of base rates to boost retirement
        savings.
      </p>
    </div>
    <p className="text-[13px] text-muted-foreground leading-[1.55]">
      The bonus interest applies to the first portion of your combined CPF
      balances.
    </p>

    <div className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/40 p-4">
        <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
          Under Age 55
        </p>
        <p className="font-bold font-mono text-[22px] text-foreground">
          +{CPF_EXTRA_INTEREST_RATE * 100}%
        </p>
        <p className="text-[12px] text-muted-foreground leading-[1.55]">
          On the first S${CPF_EXTRA_INTEREST_CAP.toLocaleString()} of combined
          OA + SA + MA balances
        </p>
        <p className="text-[11px] text-muted-foreground">
          Max extra interest: S$
          {(CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE).toFixed(0)} per
          year
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-accent/30 bg-accent/5 p-4">
        <p className="font-semibold text-[11px] text-accent uppercase tracking-[0.08em]">
          Age 55 and Above
        </p>
        <p className="font-bold font-mono text-[22px] text-accent">
          +{CPF_EXTRA_INTEREST_RATE * 100}% + {CPF_EXTRA_INTEREST_RATE * 100}%
        </p>
        <p className="text-[12px] text-muted-foreground leading-[1.55]">
          Base tier: +{CPF_EXTRA_INTEREST_RATE * 100}% on first S$
          {CPF_EXTRA_INTEREST_CAP.toLocaleString()} of combined balances
          <br />
          Senior tier: Additional +{CPF_EXTRA_INTEREST_RATE * 100}% on first S$
          {CPF_ADDITIONAL_SENIOR_INTEREST_CAP.toLocaleString()} of combined
          balances
        </p>
        <p className="text-[11px] text-muted-foreground">
          Max extra interest: S$
          {(
            CPF_EXTRA_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE +
            CPF_ADDITIONAL_SENIOR_INTEREST_CAP * CPF_EXTRA_INTEREST_RATE
          ).toFixed(0)}{" "}
          per year
        </p>
      </div>
    </div>

    <p className="text-[13px] text-muted-foreground leading-[1.55]">
      <span className="font-semibold text-foreground">How it works:</span> The
      extra interest is paid into your Special Account (or Retirement Account if
      you{"'"}re 55+). This means your SA/RA grows faster, directly increasing
      your CPF LIFE payouts in retirement.
    </p>

    <p className="text-[13px] text-muted-foreground leading-[1.55]">
      <span className="font-semibold text-foreground">Example:</span> A
      30-year-old with S$50,000 across OA + SA + MA earns an extra S$
      {(50000 * 0.01).toFixed(0)} per year (S${((50000 * 0.01) / 12).toFixed(0)}{" "}
      per month) on top of base rates.
    </p>
  </section>
);

export default CpfInterestTiersBlock;
