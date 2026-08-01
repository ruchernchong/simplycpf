import { CPF_BASIC_HEALTHCARE_SUM } from "@/constants/cpf-bhs";
import {
  CPF_INTEREST_FLOOR_RATES,
  CPF_INTEREST_RATE_METHODOLOGY,
  PEGGED_RATE_MARKUP,
  QUARTERLY_CPF_RATES,
} from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import { CPF_RETIREMENT_SUMS } from "@/constants/cpf-retirement-sums";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_POLICY_VERIFIED_AT,
  POLICY_METADATA,
  SPR_YEAR_1_CONTRIBUTION_RATES,
  SPR_YEAR_2_CONTRIBUTION_RATES,
} from "@/policy";

export const revalidate = 86400;

function formatMoney(value: number): string {
  return `S$${new Intl.NumberFormat("en-SG").format(value)}`;
}

function formatBasisPoints(value: number): string {
  return `${(value / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

function formatRate(value: number): string {
  return `${value.toFixed(2).replace(/\.00$/, "")}%`;
}

function formatAgeBand(band: {
  minAgeExclusive?: number;
  maxAgeInclusive?: number;
}): string {
  if (band.minAgeExclusive === undefined) {
    return `${band.maxAgeInclusive} and below`;
  }
  if (band.maxAgeInclusive === undefined) {
    return `Above ${band.minAgeExclusive}`;
  }
  return `Above ${band.minAgeExclusive} to ${band.maxAgeInclusive} (upper bound inclusive)`;
}

function contributionScheduleSections(): string {
  return CPF_CONTRIBUTION_SCHEDULES.map((schedule) => {
    const rows = schedule.citizenRates
      .map(
        (band) =>
          `| ${formatAgeBand(band)} | ${formatBasisPoints(band.employeeBasisPoints)} | ${formatBasisPoints(band.employerBasisPoints)} | ${formatBasisPoints(band.employeeBasisPoints + band.employerBasisPoints)} |`,
      )
      .join("\n");

    return `### ${schedule.id}

- Effective: ${schedule.effectiveFrom} to ${schedule.effectiveTo}
- Ordinary Wage ceiling: ${formatMoney(schedule.ordinaryWageCeiling)} per month
- Annual Additional Wage ceiling before annual OW and prior AW deductions: ${formatMoney(schedule.additionalWageCeiling)}
- Status: official

| Completed age band | Employee | Employer | Total |
|---|---:|---:|---:|
${rows}`;
  }).join("\n\n");
}

function allocationScheduleSections(): string {
  return CPF_CONTRIBUTION_SCHEDULES.map((schedule) => {
    const rows = schedule.allocationRates
      .map(
        (band) =>
          `| ${formatAgeBand(band)} | ${formatBasisPoints(band.oaBasisPoints)} | ${formatBasisPoints(band.retirementBasisPoints)} | ${formatBasisPoints(band.maBasisPoints)} |`,
      )
      .join("\n");

    return `### ${schedule.id}

| Completed age band | OA | Retirement allocation | MA |
|---|---:|---:|---:|
${rows}`;
  }).join("\n\n");
}

function prRateRows(rates: typeof SPR_YEAR_1_CONTRIBUTION_RATES): string {
  return rates
    .map(
      (band) =>
        `| ${formatAgeBand(band)} | ${formatBasisPoints(band.employeeBasisPoints)} | ${formatBasisPoints(band.employerBasisPoints)} | ${formatBasisPoints(band.employeeBasisPoints + band.employerBasisPoints)} |`,
    )
    .join("\n");
}

function interestRows(): string {
  return QUARTERLY_CPF_RATES.map(
    (rate) =>
      `| ${rate.quarter} | ${rate.effectiveFrom} | ${rate.effectiveTo} | ${formatRate(rate.oa)} | ${formatRate(rate.sa)} | ${formatRate(rate.ma)} | ${formatRate(rate.ra)} | [CPF Board](${rate.sourceUrl}) |`,
  ).join("\n");
}

function retirementSumRows(): string {
  return Object.entries(CPF_RETIREMENT_SUMS)
    .map(
      ([year, sums]) =>
        `| ${year} | ${formatMoney(sums.brs)} | ${formatMoney(sums.frs)} | ${formatMoney(sums.ers)} | official |`,
    )
    .join("\n");
}

function bhsRows(): string {
  return Object.entries(CPF_BASIC_HEALTHCARE_SUM)
    .map(([year, amount]) => `| ${year} | ${formatMoney(amount)} | official |`)
    .join("\n");
}

function cpfLifeRows(): string {
  return CPF_LIFE_2026_REFERENCE.rows
    .map(
      (row) =>
        `| ${formatMoney(row.raAt55)} | ${formatMoney(row.raAt65)} | ${formatMoney(row.monthlyPayoutAt65)} | ${formatMoney(row.monthlyPayoutAt70)} | ${row.label ?? "—"} |`,
    )
    .join("\n");
}

function provenanceRows(): string {
  return Object.values(POLICY_METADATA)
    .map((metadata) => {
      const sources = metadata.sources
        .map((source) => `[${source.agency}: ${source.title}](${source.url})`)
        .join("; ");
      return `| ${metadata.dataset} | ${metadata.status} | ${metadata.effectiveFrom} | ${metadata.verifiedAt} | ${sources} |`;
    })
    .join("\n");
}

const cpfRatesMarkdown = `# CPF policy reference

> SimplyCPF API contract v2.0.0. Each dataset below carries its own effective period, status, official source, and verification date. SimplyCPF is independent and not affiliated with CPF Board, IRAS, MOM, or any government agency.

## Scope

Contribution data covers private-sector and non-pensionable employees who are Singapore Citizens or Permanent Residents using CPF Board's default Graduated/Graduated rates. Platform workers, self-employed persons, pensionable employees, and approved alternative PR contribution arrangements are out of scope.

## Status vocabulary

- **official**: a value or rule published by the responsible government agency.
- **assumed**: a SimplyCPF modelling choice. Public reference endpoints never extrapolate an official value. A projection may hold the last published policy constant, but marks every affected year **assumed**.

## Official contribution schedules: Singapore Citizens and SPR Year 3+

Rates below apply to monthly total wages above S$750. The completed-age upper bound is inclusive. A member moves to the next contribution rate from the first day of the month after turning 55, 60, 65, or 70.

${contributionScheduleSections()}

## Default Graduated/Graduated PR schedules

The Year 1 and Year 2 G/G rates below have been unchanged since 1 January 2016. Year 1 begins on the PR conversion date. Year 2 begins on the first day of the month after the first anniversary, and Year 3 begins on the first day of the month after the second anniversary.

### SPR Year 1

| Completed age band | Employee | Employer | Total |
|---|---:|---:|---:|
${prRateRows(SPR_YEAR_1_CONTRIBUTION_RATES)}

### SPR Year 2

| Completed age band | Employee | Employer | Total |
|---|---:|---:|---:|
${prRateRows(SPR_YEAR_2_CONTRIBUTION_RATES)}

## Wage bands, ceilings, and rounding

- Total wages of S$50 or less: no CPF contribution.
- Above S$50 to S$500: employer share applies; employee share is zero.
- Above S$500 to S$750: employee share is phased in under CPF Board's tables; employer share applies.
- Above S$750: full rates in the schedule tables apply.
- Ordinary Wages are capped by the schedule's monthly OW ceiling.
- The remaining AW ceiling is max(0, S$102,000 − annual OW subject to CPF − prior AW subject to CPF). An AW calculation without this annual context is rejected with HTTP 422.
- Total contribution is rounded to the nearest dollar, with 50 cents rounded upwards. Cents in the employee share are discarded. Employer share is the rounded total minus employee share.

## Official allocation schedules

Allocation rates are proportions of total CPF contribution, not of wages. The engine allocates MA first, retirement savings second, and OA as the exact remainder so no cent disappears. Before 2025 the retirement allocation is SA. Following the 2025 SA closure, members aged 55 and above receive that allocation in RA until FRS; after FRS it is routed to OA. If account context is absent, the contribution API returns both official branches.

${allocationScheduleSections()}

## Published retirement sums

Public reference values stop at the last published cohort. Projections hold the 2027 amounts constant in later years and mark them assumed; they do not extrapolate.

| Year member turns 55 | BRS | FRS | ERS | Status |
|---|---:|---:|---:|---|
${retirementSumRows()}

Source: [CPF Board — What is the CPF retirement sum?](https://www.cpf.gov.sg/member/infohub/educational-resources/what-is-the-cpf-retirement-sum). Verified 2026-08-01.

## Published Basic Healthcare Sum

The BHS is fixed for a member when they turn 65. CPF Board publishes S$49,800 for members born in 1951 or earlier. Public reference values stop at 2026; later projection years hold the member's applicable last published amount constant and mark it assumed.

| Cohort/year | BHS | Status |
|---|---:|---|
${bhsRows()}

Source: [CPF Board — What is the Basic Healthcare Sum?](https://www.cpf.gov.sg/service/article/what-is-the-basic-healthcare-sum). Verified 2026-08-01.

## Official quarterly CPF interest declarations

There is no synthetic monthly SGS series. OA is reviewed quarterly using the three-month average of major local banks' interest rates, subject to the ${formatRate(CPF_INTEREST_FLOOR_RATES.OA)} legislated floor. SMRA is reviewed quarterly using the 12-month average 10-year SGS yield plus ${formatRate(PEGGED_RATE_MARKUP)}, subject to the current ${formatRate(CPF_INTEREST_FLOOR_RATES.SMRA)} floor through 2026.

| Quarter | Effective from | Effective to | OA | SA | MA | RA | Official declaration |
|---|---|---|---:|---:|---:|---:|---|
${interestRows()}

Methodology source: [CPF Board — How are CPF interest rates determined?](${CPF_INTEREST_RATE_METHODOLOGY.sourceUrl}). Verified ${CPF_INTEREST_RATE_METHODOLOGY.verifiedAt}.

### Extra interest

- Members below 55 receive an extra ${formatRate(CPF_EXTRA_INTEREST_RATE * 100)} on the first ${formatMoney(CPF_EXTRA_INTEREST_CAP)} of combined balances; at most ${formatMoney(CPF_OA_EXTRA_INTEREST_CAP)} can come from OA.
- Members 55 and above receive an additional ${formatRate(CPF_EXTRA_INTEREST_RATE * 100)} on the first ${formatMoney(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}, plus ${formatRate(CPF_EXTRA_INTEREST_RATE * 100)} on the next ${formatMoney(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}; at most ${formatMoney(CPF_OA_EXTRA_INTEREST_CAP)} can come from OA.
- CPF Board prioritises retirement savings (RA or SA), then OA up to its cap, then MA when determining eligible combined balances. Extra interest earned on OA is credited to SA below 55 or RA from 55.

Source: [CPF Board — How much extra interest can I earn?](https://www.cpf.gov.sg/service/article/how-much-extra-interest-can-i-earn-on-my-cpf-savings). Verified 2026-08-01.

## CPF LIFE 2026 reference rows

These are CPF Board's exact reference figures for a male member on the Standard Plan. SimplyCPF does not interpolate them or calculate a personalised payout. Use [CPF Board's planner](${CPF_LIFE_2026_REFERENCE.personalisedEstimatorUrl}) for a personalised estimate. S$60,000 is an automatic-inclusion condition for certain cohorts, not a minimum joining balance or payout threshold.

| RA at 55 | RA at 65 | Monthly payout from 65 | Monthly payout from 70 | Reference label |
|---:|---:|---:|---:|---|
${cpfLifeRows()}

Source: [CPF Board — How much CPF payouts can I get every month?](${CPF_LIFE_2026_REFERENCE.sourceUrl}). Verified ${CPF_LIFE_2026_REFERENCE.verifiedAt}.

## Projection contract and SimplyCPF assumptions

- New requests supply \`startMonth\` and starting OA, SA, MA, and RA balances. A legacy request may default balances to zero only with an explicit warning.
- The ledger applies contributions and interest monthly, then credits interest annually. It handles birthday transitions, the 2025 SA closure, age-65 BHS freezing, MA overflow, and FRS routing.
- Salary is fixed monthly Ordinary Wages unless the caller supplies AW context. No salary growth or bonus is inferred.
- Published post-2027 contribution rules, post-2026 BHS, and post-2027 retirement sums are held constant and labelled assumed.
- \`retirementTransfer\` routes to SA below 55 and RA from 55. \`oaToSaTransfer\` is a deprecated alias for one compatibility cycle.
- Actual top-up capacity is distinct from IRAS's S$8,000 self and S$8,000 family tax-relief caps.
- \`cpfLifeReference\` returns the table above. Deprecated \`cpfLifeEstimate\` is always null with a migration warning.

## API v2 compatibility and errors

- Contribution input: \`contributionMonth\`, \`ordinaryWages\`, optional \`additionalWages\` with AW context, \`citizenship\`, and either completed \`age\` or \`birthMonth\`.
- Deprecated for one compatibility cycle: \`income\` → \`ordinaryWages\`; \`date\` → \`contributionMonth\`; \`oaToSaTransfer\` → \`retirementTransfer\`; \`sgsYield\` → \`averageSgsYield\`.
- Unsupported official policy months or years return 404. Missing AW context and other semantically incomplete requests return 422. No public reference API silently clamps or fabricates a value.
- Policy responses use \`public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400\`; policy data is never cached as year-long immutable content.

## Per-dataset provenance

| Dataset | Status | Effective from | Verified | First-party sources |
|---|---|---|---|---|
${provenanceRows()}

Catalogue verification date: ${CPF_POLICY_VERIFIED_AT}. This is not a global effective date; each dataset and schedule above carries its own effective period.

## Adjacent official facts

- IRAS CPF Cash Top-up Relief is capped at up to S$8,000 for self and S$8,000 for family members, subject to IRAS conditions and the overall personal relief cap. This is not the actual CPF top-up capacity. [IRAS source](https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund-%28cpf%29-cash-top-up-relief).
- From 1 July 2026, the statutory retirement age is 64 and re-employment age is 69, subject to MOM's cohort rules. [MOM source](https://www.mom.gov.sg/employment-practices/re-employment).

## Disclaimer

Official values link to their responsible first-party agency. Readiness scoring, CPF Check, long-range projection choices, housing-sale scenarios, and non-CPF investment returns are SimplyCPF tools or user assumptions, not CPF Board facts. Figures are not financial advice.
`;

export async function GET(): Promise<Response> {
  return new Response(cpfRatesMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      ...CACHE_HEADERS.policy,
    },
  });
}
