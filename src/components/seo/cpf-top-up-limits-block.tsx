import { Card } from "@heroui/react";
import { formatNumber } from "@/lib/format";

/**
 * Cash top-up tax relief under the Retirement Sum Topping-Up Scheme, and the
 * separate Matched Retirement Savings Scheme matching grant.
 *
 * Tax relief caps and the spouse/sibling income condition (raised to $8,000
 * from YA2025): IRAS, CPF Cash Top-up Relief.
 * https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund-(cpf)-cash-top-up-relief
 *
 * MRSS matching grant, caps and the removal of the age-70 limit from
 * 1 January 2025: CPF Board, Matching grant for retirement.
 * https://www.cpf.gov.sg/member/growing-your-savings/government-support/matching-grant-for-retirement
 */
const TAX_RELIEF_SELF = 8000;
const TAX_RELIEF_FAMILY = 8000;
const FAMILY_INCOME_CONDITION = 8000;
const MRSS_ANNUAL_CAP = 2000;
const MRSS_LIFETIME_CAP = 20000;

const CpfTopUpLimitsBlock = () => {
  const combinedRelief = TAX_RELIEF_SELF + TAX_RELIEF_FAMILY;
  // Illustrative only: the 4% SMRA floor rate compounded from age 30 to 55,
  // rounded to the nearest hundred. Extra interest is not modelled.
  const topUpAtFiftyFive =
    Math.round((TAX_RELIEF_SELF * 1.04 ** 25) / 100) * 100;

  return (
    <section
      aria-labelledby="cpf-top-up-limits"
      data-content-block="definition"
    >
      <Card>
        <Card.Header>
          <Card.Title id="cpf-top-up-limits">
            CPF Top-Up Limits & Tax Relief
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
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
                Up to S${formatNumber(TAX_RELIEF_SELF)}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Cash top-up to your SA (under 55) or RA (55+) qualifies for tax
                relief
              </p>
              <p className="mt-2 text-accent text-xs">
                Tax relief cap: S${formatNumber(TAX_RELIEF_SELF)} per calendar
                year
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 font-semibold text-sm">
                Top-Up for Family Members
              </p>
              <p className="font-bold text-2xl text-foreground">
                Up to S${formatNumber(TAX_RELIEF_FAMILY)}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Top-up parents, parents-in-law, grandparents, spouse, or
                siblings
              </p>
              <p className="mt-2 text-accent text-xs">
                Separate S${formatNumber(TAX_RELIEF_FAMILY)} cap for family
                top-ups
              </p>
            </div>
          </div>

          <p>
            <strong>How the tax relief works:</strong>
          </p>
          <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
            <li>
              The relief goes to the person making the top-up, not the person
              receiving it
            </li>
            <li>
              Maximum combined relief: S${formatNumber(combinedRelief)} per year
              (S${formatNumber(TAX_RELIEF_SELF)} for your own account plus S$
              {formatNumber(TAX_RELIEF_FAMILY)} for family members)
            </li>
            <li>
              For top-ups to a spouse or sibling, their income in the preceding
              year must not exceed S$
              {formatNumber(FAMILY_INCOME_CONDITION)} (from YA2025; it was
              S$4,000 before). No income condition applies to parents,
              parents-in-law or grandparents
            </li>
            <li>
              Transfers from your own CPF account do not qualify, only cash
              top-ups do
            </li>
          </ul>

          <p>
            <strong>Matched Retirement Savings Scheme (MRSS):</strong>
          </p>
          <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
            <li>
              A separate government matching grant, dollar for dollar, on cash
              top-ups to eligible members&rsquo; retirement savings
            </li>
            <li>
              Up to S${formatNumber(MRSS_ANNUAL_CAP)} a year, capped at S$
              {formatNumber(MRSS_LIFETIME_CAP)} over a lifetime
            </li>
            <li>
              For members aged 55 and above with Retirement Account savings
              below the Basic Retirement Sum, subject to income and property
              criteria. The upper age limit of 70 was removed on 1 January 2025
            </li>
            <li>
              Top-ups that attract an MRSS grant do not also attract the cash
              top-up tax relief
            </li>
          </ul>

          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> Top-ups are irreversible. Once you transfer
            cash to CPF, it stays in CPF until retirement age (or for approved
            housing/education/insurance purposes from OA only).
          </p>

          <p className="text-muted-foreground text-sm">
            <strong>Strategy tip:</strong> Top-ups early in the year earn a full
            year of interest. A S${formatNumber(TAX_RELIEF_SELF)} top-up to SA
            at age 30, left untouched at the 4% floor rate, would be worth about
            S${formatNumber(topUpAtFiftyFive)} at 55. This illustration uses the
            floor rate only and ignores extra interest.
          </p>
        </Card.Content>
      </Card>
    </section>
  );
};

export default CpfTopUpLimitsBlock;
