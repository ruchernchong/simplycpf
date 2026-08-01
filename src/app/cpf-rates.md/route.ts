import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  CPF_POLICY_CATALOGUE,
  CPF_POLICY_VERIFIED_AT,
  POLICY_METADATA,
  POLICY_SOURCES,
  SPR_YEAR_1_CONTRIBUTION_RATES,
  SPR_YEAR_2_CONTRIBUTION_RATES,
} from "@/policy";

export const revalidate = 86400;

const {
  basicHealthcareSums,
  contributionSchedules,
  cpfLife,
  interestRateMethodology,
  quarterlyInterestRates,
  retirementSums,
  rules,
} = CPF_POLICY_CATALOGUE;

const earliestBhs = basicHealthcareSums[0];
const latestBhs = basicHealthcareSums.at(-1);
const latestRetirementSums = retirementSums.at(-1);
const latestContributionSchedule = contributionSchedules.at(-1);

if (
  !earliestBhs ||
  !latestBhs ||
  !latestRetirementSums ||
  !latestContributionSchedule
) {
  throw new Error("The canonical CPF policy catalogue is incomplete.");
}

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
  return contributionSchedules
    .map((schedule) => {
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
    })
    .join("\n\n");
}

function allocationScheduleSections(): string {
  return contributionSchedules
    .map((schedule) => {
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
    })
    .join("\n\n");
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
  return quarterlyInterestRates
    .map(
      (rate) =>
        `| ${rate.quarter} | ${rate.effectiveFrom} | ${rate.effectiveTo} | ${formatRate(rate.oa)} | ${formatRate(rate.sa)} | ${formatRate(rate.ma)} | ${formatRate(rate.ra)} | [CPF Board](${rate.sourceUrl}) |`,
    )
    .join("\n");
}

function retirementSumRows(): string {
  return retirementSums
    .map(
      (row) =>
        `| ${row.year} | ${formatMoney(row.brs)} | ${formatMoney(row.frs)} | ${formatMoney(row.ers)} | ${row.status} |`,
    )
    .join("\n");
}

function bhsRows(): string {
  return basicHealthcareSums
    .map(
      (row) => `| ${row.year} | ${formatMoney(row.amount)} | ${row.status} |`,
    )
    .join("\n");
}

function cpfLifeRows(): string {
  return cpfLife.reference.rows
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

Rates below apply to monthly total wages above ${formatMoney(rules.wageBands.fullRatesAbove)}. The completed-age upper bound is inclusive. A member moves to the next contribution rate from the first day of the month after crossing a published age-band boundary.

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

- Total wages of ${formatMoney(rules.wageBands.noContributionAtOrBelow)} or less: no CPF contribution.
- Above ${formatMoney(rules.wageBands.noContributionAtOrBelow)} to ${formatMoney(rules.wageBands.employerOnlyAtOrBelow)}: employer share applies; employee share is zero.
- Above ${formatMoney(rules.wageBands.employerOnlyAtOrBelow)} to ${formatMoney(rules.wageBands.phasedEmployeeShareAtOrBelow)}: employee share is phased in under CPF Board's tables; employer share applies.
- Above ${formatMoney(rules.wageBands.fullRatesAbove)}: full rates in the schedule tables apply.
- Ordinary Wages are capped by the schedule's monthly OW ceiling.
- The remaining AW ceiling is max(0, ${formatMoney(rules.wageBands.annualAdditionalWageCeiling)} − annual OW subject to CPF − prior AW subject to CPF). An AW calculation without this annual context is rejected with HTTP 422.
- Total contribution is rounded to the nearest dollar, with 50 cents rounded upwards. Cents in the employee share are discarded. Employer share is the rounded total minus employee share.

## Official allocation schedules

Allocation rates are proportions of total CPF contribution, not of wages. The engine allocates MA first, retirement savings second, and OA as the exact remainder so no cent disappears. Before ${rules.specialAccountClosure.effectiveDate.slice(0, 4)} the retirement allocation is SA. Following the SA closure, members aged ${rules.lifecycleAges.specialAccountClosed} and above receive that allocation in RA until FRS; after FRS it is routed to OA. If account context is absent, the contribution API returns both official branches.

${allocationScheduleSections()}

## Published retirement sums

Public reference values stop at the last published cohort. Projections hold the ${latestRetirementSums.year} amounts constant in later years and mark them assumed; they do not extrapolate.

| Year member turns ${rules.lifecycleAges.retirementAccountCreated} | BRS | FRS | ERS | Status |
|---|---:|---:|---:|---|
${retirementSumRows()}

Source: [CPF Board — What is the CPF retirement sum?](${POLICY_SOURCES.retirementSums.url}). Verified ${CPF_POLICY_VERIFIED_AT}.

## Published Basic Healthcare Sum

The BHS is fixed for a member when they turn ${rules.lifecycleAges.cpfLifePayoutEligibility}. CPF Board publishes ${formatMoney(earliestBhs.amount)} for members born in ${earliestBhs.cohortBirthYearAtOrBefore} or earlier. Public reference values stop at ${latestBhs.year}; later projection years hold the member's applicable last published amount constant and mark it assumed.

| Cohort/year | BHS | Status |
|---|---:|---|
${bhsRows()}

Source: [CPF Board — What is the Basic Healthcare Sum?](${POLICY_SOURCES.basicHealthcareSum.url}). Verified ${CPF_POLICY_VERIFIED_AT}.

## Official quarterly CPF interest declarations

There is no synthetic monthly SGS series. OA is reviewed quarterly using the three-month average of major local banks' interest rates, subject to the ${formatRate(interestRateMethodology.ordinaryAccount.floorRate)} legislated floor. SMRA is reviewed quarterly using the 12-month average 10-year SGS yield plus ${formatRate(interestRateMethodology.specialMediSaveRetirementAccounts.markupPercentagePoints)}, subject to the current ${formatRate(interestRateMethodology.specialMediSaveRetirementAccounts.floorRate)} floor through ${interestRateMethodology.specialMediSaveRetirementAccounts.floorGuaranteedThrough.slice(0, 4)}.

| Quarter | Effective from | Effective to | OA | SA | MA | RA | Official declaration |
|---|---|---|---:|---:|---:|---:|---|
${interestRows()}

Methodology source: [CPF Board — How are CPF interest rates determined?](${POLICY_SOURCES.interestMethodology.url}). Verified ${interestRateMethodology.verifiedAt}.

### Extra interest

- Members below 55 receive an extra ${formatRate(rules.extraInterest.below55.extraPercentagePoints)} on the first ${formatMoney(rules.extraInterest.below55.balanceCap)} of combined balances; at most ${formatMoney(rules.extraInterest.ordinaryAccountCap)} can come from OA.
- Members 55 and above receive an additional ${formatRate(rules.extraInterest.age55AndAbove.firstTier.extraPercentagePoints)} on the first ${formatMoney(rules.extraInterest.age55AndAbove.firstTier.balanceCap)}, plus ${formatRate(rules.extraInterest.age55AndAbove.secondTier.extraPercentagePoints)} on the next ${formatMoney(rules.extraInterest.age55AndAbove.secondTier.balanceCap)}; at most ${formatMoney(rules.extraInterest.ordinaryAccountCap)} can come from OA.
- CPF Board computes eligible combined balances in this order: ${rules.extraInterest.accountPriority.join(", ")} (RA includes any CPF LIFE premium balance, and OA is capped at ${formatMoney(rules.extraInterest.ordinaryAccountCap)}). Extra interest earned on SA, RA, and MA stays in the respective account; extra interest earned on OA is credited to ${rules.extraInterest.below55.oaExtraInterestCreditedTo} below ${rules.lifecycleAges.retirementAccountCreated} or ${rules.extraInterest.age55AndAbove.oaExtraInterestCreditedTo} from ${rules.lifecycleAges.retirementAccountCreated}.

Source: [CPF Board — How much extra interest can I earn?](${POLICY_SOURCES.extraInterest.url}). Verified ${CPF_POLICY_VERIFIED_AT}.

## CPF LIFE ${cpfLife.reference.year} reference rows

These are CPF Board's exact reference figures for a ${cpfLife.reference.profile} member on the ${cpfLife.reference.plan} Plan. SimplyCPF does not interpolate them or calculate a personalised payout. Use [CPF Board's planner](${cpfLife.reference.personalisedEstimatorUrl}) for a personalised estimate. ${formatMoney(cpfLife.automaticInclusion.minimumRetirementSavingsAtPayoutStart)} is an automatic-inclusion condition for certain cohorts, not a minimum joining balance or payout threshold.

| RA at ${rules.lifecycleAges.retirementAccountCreated} | RA at ${rules.lifecycleAges.cpfLifePayoutEligibility} | Monthly payout from ${rules.lifecycleAges.cpfLifePayoutEligibility} | Monthly payout from ${rules.lifecycleAges.latestCpfLifePayoutStart} | Reference label |
|---:|---:|---:|---:|---|
${cpfLifeRows()}

Source: [CPF Board — How much CPF payouts can I get every month?](${POLICY_SOURCES.cpfLifeReferencePayouts.url}). Verified ${cpfLife.verifiedAt}.

## Projection contract and SimplyCPF assumptions

- New requests supply \`startMonth\` and starting OA, SA, MA, and RA balances. A legacy request may default balances to zero only with an explicit warning.
- The ledger applies contributions and interest monthly, then credits interest annually. It handles birthday transitions, the 2025 SA closure, age-65 BHS freezing, MA overflow, and FRS routing.
- SPR Year 1/2 requests should supply \`permanentResidentSince\` so anniversary transitions resolve to the correct G/G schedule. Legacy omission freezes the selected SPR year and is warned as an assumption.
- Salary is fixed monthly Ordinary Wages unless the caller supplies AW context. No salary growth or bonus is inferred.
- Published post-${latestContributionSchedule.effectiveTo.slice(0, 4)} contribution rules, post-${latestBhs.year} BHS, and post-${latestRetirementSums.year} retirement sums are held constant and labelled assumed.
- \`retirementTransfer\` routes to SA below 55 and RA from 55. \`oaToSaTransfer\` is a deprecated alias for one compatibility cycle.
- Actual top-up capacity is distinct from IRAS's ${formatMoney(rules.retirementTopUps.taxRelief.selfAnnualCap)} self and ${formatMoney(rules.retirementTopUps.taxRelief.familyAnnualCap)} family tax-relief caps.
- Pre-55 net SA savings withdrawn for investments count towards the FRS limit. If the netSaSavingsWithdrawnForInvestments field is unavailable when relevant, projected top-up or transfer capacity can be overstated and the response returns the retirement-top-up-capacity-context-missing warning.
- \`cpfLifeReference\` returns the table above. Deprecated \`cpfLifeEstimate\` is always null with a migration warning.

## API v2 compatibility and errors

- Contribution input: \`contributionMonth\`, \`ordinaryWages\`, optional \`additionalWages\` with AW context, \`citizenship\`, and either completed \`age\` or \`birthMonth\`.
- Generic age bands that cross 55 expose age-dependent SA-to-RA routing; exact lookups resolve age 55 to RA. The deterministic age-conversion query uses \`birthMonth\` plus \`contributionMonth\`; \`birthDate\` is deprecated.
- Interest declarations return full policy metadata; \`/interest-rates/trend\` uses the \`{ observations, methodology, policy }\` envelope.
- Deprecated for one compatibility cycle: contribution \`income\` → \`ordinaryWages\` and \`date\` → \`contributionMonth\`; projection \`income\`/\`age\`/\`years\` → the v2 monthly-ledger fields, \`startAge\` → exact \`birthDate\`, and \`oaToSaTransfer\` → \`retirementTransfer\`; interest \`sgsYield\` → \`averageSgsYield\`.
- Unsupported official policy months or years return 404. Missing AW context and other semantically incomplete requests return 422. No public reference API silently clamps or fabricates a value.
- Policy responses use \`public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400\`; policy data is never cached as year-long immutable content.

## Per-dataset provenance

| Dataset | Status | Effective from | Verified | First-party sources |
|---|---|---|---|---|
${provenanceRows()}

Catalogue verification date: ${CPF_POLICY_VERIFIED_AT}. This is not a global effective date; each dataset and schedule above carries its own effective period.

## Adjacent official facts

- IRAS CPF Cash Top-up Relief is capped at up to ${formatMoney(rules.retirementTopUps.taxRelief.selfAnnualCap)} for self and ${formatMoney(rules.retirementTopUps.taxRelief.familyAnnualCap)} for family members, subject to IRAS conditions and the overall personal relief cap. This is not the actual CPF top-up capacity. [IRAS source](${POLICY_SOURCES.irasCashTopUpRelief.url}).
- From ${rules.statutoryEmploymentAges.effectiveDate}, the statutory retirement age is ${rules.statutoryEmploymentAges.retirementAge} and re-employment age is ${rules.statutoryEmploymentAges.reEmploymentAge}, subject to MOM's cohort rules. [MOM source](${POLICY_SOURCES.momRetirementAges.url}).

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
