import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  CPF_POLICY_CATALOGUE,
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

Contribution data covers Singapore Citizens and Permanent Residents in private-sector, non-pensionable employment. PR calculations use CPF Board's default Graduated/Graduated rates. Platform workers, self-employed persons, pensionable employees, and approved alternative PR contribution arrangements are out of scope.

## Status vocabulary

- **official**: a value or rule published by the responsible government agency.
- **assumed**: a SimplyCPF modelling choice. Public reference endpoints never extrapolate an official value. A projection may hold the last published policy constant, but marks every affected year **assumed**.

## Official contribution schedules: Singapore Citizens and SPR Year 3+

Rates below apply to monthly total wages above ${formatMoney(rules.wageBands.fullRatesAbove)}. The completed-age upper bound is inclusive. A member moves to the next contribution rate from the first day of the month after crossing a published age-band boundary.

${contributionScheduleSections()}

## Default Graduated/Graduated PR schedules

The Year 1 and Year 2 G/G rates below have been unchanged since ${rules.permanentResidentGraduatedRates.effectiveFrom}. Year 1 begins on the ${rules.permanentResidentGraduatedRates.year1Starts}. Later PR years begin on the ${rules.permanentResidentGraduatedRates.laterYearsStart}.

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
- Total contribution is rounded to the ${rules.contributionRounding.totalContributionUnit}, with ${rules.contributionRounding.totalContributionHalfUpAtCents} cents rounded upwards. Employee share: ${rules.contributionRounding.employeeShare}. Employer share: ${rules.contributionRounding.employerShare}.

## Official allocation schedules

Allocation rates are proportions of total CPF contribution, not of wages. The engine allocates MA first, retirement savings second, and OA as the exact remainder so no cent disappears. Before ${rules.specialAccountClosure.effectiveDate.slice(0, 4)} the retirement allocation is SA. Following the SA closure, members aged ${rules.lifecycleAges.specialAccountClosed} and above receive that allocation in RA until FRS; after FRS it is routed to OA. If account context is absent, the contribution API returns both official branches.

${allocationScheduleSections()}

## Published retirement sums

Public reference values stop at the last published cohort. Projections hold the ${latestRetirementSums.year} amounts constant in later years and mark them assumed; they do not extrapolate.

| Year member turns ${rules.lifecycleAges.retirementAccountCreated} | BRS | FRS | ERS | Status |
|---|---:|---:|---:|---|
${retirementSumRows()}

Source: [CPF Board — What is the CPF retirement sum?](${POLICY_SOURCES.retirementSums.url}). Verified ${POLICY_METADATA["cpf-retirement-sums"].verifiedAt}.

## Retirement withdrawal qualifications

Withdrawal rules depend on birth cohort and individual account history. Under the current rules for members born in ${rules.retirementWithdrawals.cohortBornOnOrAfter.slice(0, 4)} or later:

- From age ${rules.lifecycleAges.retirementAccountCreated}, ${formatMoney(rules.retirementWithdrawals.fromAge55.unconditionalAmount)} is unconditionally withdrawable. After FRS is set aside, excess OA savings are withdrawable.
- A completed Singapore property with a lease lasting to at least age ${rules.retirementWithdrawals.fromAge55.propertyOption.minimumRemainingLeaseThroughAge} may support withdrawal of eligible RA principal down to BRS. Interest, government grants and retirement top-ups are generally excluded, and the RA must be restored towards FRS when the property is sold or transferred.
- From age ${rules.lifecycleAges.cpfLifePayoutEligibility}, the cohort may withdraw an additional amount based on up to ${rules.retirementWithdrawals.fromAge65.additionalRetirementSavingsPercentage}% of retirement savings, less the ${formatMoney(rules.retirementWithdrawals.fromAge65.lessAge55WithdrawableAmount)} available from age ${rules.lifecycleAges.retirementAccountCreated}. CPF Board applies further exclusions and personal account history.

Source: [CPF Board — Withdrawing for immediate retirement needs](${POLICY_SOURCES.retirementWithdrawals.url}) and [cohort table](${POLICY_SOURCES.withdrawalCohorts.url}). Verified ${POLICY_METADATA["cpf-retirement-withdrawals"].verifiedAt}. Members should use CPF Board's Retirement Dashboard for their personal withdrawable amount.

## Published Basic Healthcare Sum

The BHS is fixed for a member when they turn ${rules.lifecycleAges.basicHealthcareSumFrozen}. CPF Board publishes ${formatMoney(earliestBhs.amount)} for members born in ${earliestBhs.cohortBirthYearAtOrBefore} or earlier. Public reference values stop at ${latestBhs.year}; later projection years hold the member's applicable last published amount constant and mark it assumed.

| Cohort/year | BHS | Status |
|---|---:|---|
${bhsRows()}

Source: [CPF Board — What is the Basic Healthcare Sum?](${POLICY_SOURCES.basicHealthcareSum.url}). Verified ${POLICY_METADATA["cpf-basic-healthcare-sum"].verifiedAt}.

## Official quarterly CPF interest declarations

There is no synthetic monthly SGS series. OA is reviewed quarterly using the three-month average of major local banks' interest rates, subject to the ${formatRate(interestRateMethodology.ordinaryAccount.floorRate)} legislated floor. SMRA is reviewed quarterly using the 12-month average 10-year SGS yield plus ${formatRate(interestRateMethodology.specialMediSaveRetirementAccounts.markupPercentagePoints)}, subject to the current ${formatRate(interestRateMethodology.specialMediSaveRetirementAccounts.floorRate)} floor through ${interestRateMethodology.specialMediSaveRetirementAccounts.floorGuaranteedThrough.slice(0, 4)}.

| Quarter | Effective from | Effective to | OA | SA | MA | RA | Official declaration |
|---|---|---|---:|---:|---:|---:|---|
${interestRows()}

Methodology source: [CPF Board — How are CPF interest rates determined?](${POLICY_SOURCES.interestMethodology.url}). Verified ${interestRateMethodology.verifiedAt}.

### Extra interest

- Members below ${rules.lifecycleAges.retirementAccountCreated} receive an extra ${formatRate(rules.extraInterest.below55.extraPercentagePoints)} on the first ${formatMoney(rules.extraInterest.below55.balanceCap)} of combined balances; at most ${formatMoney(rules.extraInterest.ordinaryAccountCap)} can come from OA.
- Members ${rules.lifecycleAges.retirementAccountCreated} and above receive an additional ${formatRate(rules.extraInterest.age55AndAbove.firstTier.extraPercentagePoints)} on the first ${formatMoney(rules.extraInterest.age55AndAbove.firstTier.balanceCap)}, plus ${formatRate(rules.extraInterest.age55AndAbove.secondTier.extraPercentagePoints)} on the next ${formatMoney(rules.extraInterest.age55AndAbove.secondTier.balanceCap)}; at most ${formatMoney(rules.extraInterest.ordinaryAccountCap)} can come from OA.
- CPF Board computes eligible combined balances in this order: ${rules.extraInterest.accountPriority.join(", ")} (RA includes any CPF LIFE premium balance, and OA is capped at ${formatMoney(rules.extraInterest.ordinaryAccountCap)}). Extra interest earned on SA, RA, and MA stays in the respective account; extra interest earned on OA is credited to ${rules.extraInterest.below55.oaExtraInterestCreditedTo} below ${rules.lifecycleAges.retirementAccountCreated} or ${rules.extraInterest.age55AndAbove.oaExtraInterestCreditedTo} from ${rules.lifecycleAges.retirementAccountCreated}.

Source: [CPF Board — How much extra interest can I earn?](${POLICY_SOURCES.extraInterest.url}). Verified ${POLICY_METADATA["cpf-extra-interest"].verifiedAt}.

## CPF LIFE ${cpfLife.reference.year} reference rows

These are CPF Board's exact reference figures for a ${cpfLife.reference.profile} member on the ${cpfLife.reference.plan} Plan. SimplyCPF does not interpolate them or calculate a personalised payout. Use [CPF Board's planner](${cpfLife.reference.personalisedEstimatorUrl}) for a personalised estimate. ${formatMoney(cpfLife.automaticInclusion.minimumRetirementSavingsAtPayoutStart)} is an automatic-inclusion condition for certain cohorts, not a minimum joining balance or payout threshold.

| RA at ${rules.lifecycleAges.retirementAccountCreated} | RA at ${rules.lifecycleAges.cpfLifePayoutEligibility} | Monthly payout from ${rules.lifecycleAges.cpfLifePayoutEligibility} | Monthly payout from ${rules.lifecycleAges.latestCpfLifePayoutStart} | Reference label |
|---:|---:|---:|---:|---|
${cpfLifeRows()}

Source: [CPF Board — How much CPF payouts can I get every month?](${POLICY_SOURCES.cpfLifeReferencePayouts.url}). Verified ${cpfLife.verifiedAt}.

## Projection contract and SimplyCPF assumptions

- New requests supply \`startMonth\` and starting OA, SA, MA, and RA balances. A legacy request may default balances to zero and startMonth to the current Singapore month only with explicit warnings.
- Starting balances are the opening balances of startMonth. Starts after January should supply initialYearToDateAccruedInterest; otherwise unknown accrued interest defaults to zero with a warning. Callers can also supply the two opening RA-savings measures and cash top-up relief already used in the start year. The limits measure excludes interest and generally government grants but includes counted withdrawals and CPF LIFE premiums; the contribution-routing measure is RA cash principal and is reduced by a property-backed withdrawal.
- The ledger applies contributions monthly. Interest is computed ${rules.interestTransactions.computation} and credited ${rules.interestTransactions.crediting}; fresh inflows start earning in the ${rules.interestTransactions.freshInflowsStartEarning}, while existing-CPF transfers earn in the destination from the ${rules.interestTransactions.existingCpfTransfersStartEarningInDestination}. It handles birthday transitions, the ${rules.specialAccountClosure.effectiveDate.slice(0, 4)} SA closure, age-${rules.lifecycleAges.basicHealthcareSumFrozen} BHS freezing, MA overflow, and FRS routing.
- Published quarterly interest is used where available, followed by the official floor-rate assumption. Top-ups occur after monthly employment contributions. CPF LIFE premiums and payouts are not modelled.
- SPR Year 1/2 requests should supply \`permanentResidentSince\` so anniversary transitions resolve to the correct G/G schedule. Legacy omission freezes the selected SPR year and is warned as an assumption.
- Salary is fixed monthly Ordinary Wages. Optional \`additionalWages\` is an array of one-off payments; every entry supplies \`contributionMonth\`, \`amount\`, and \`additionalWageCeilingContext\` containing either annual OW plus prior AW subject to CPF or a remaining AW ceiling established from payroll records. AW is never inferred. Incomplete context, duplicate payment months, or payments outside the projection range return 422.
- Published post-${latestContributionSchedule.effectiveTo.slice(0, 4)} contribution rules, post-${latestBhs.year} BHS, and post-${latestRetirementSums.year} retirement sums are held constant and labelled assumed.
- \`retirementTransfer\` routes to SA below ${rules.lifecycleAges.retirementAccountCreated} and RA from ${rules.lifecycleAges.retirementAccountCreated}. \`oaToSaTransfer\` is a deprecated alias for one compatibility cycle.
- Actual top-up capacity is distinct from IRAS's ${formatMoney(rules.retirementTopUps.taxRelief.selfAnnualCap)} self and ${formatMoney(rules.retirementTopUps.taxRelief.familyAnnualCap)} family tax-relief caps.
- Before ${rules.lifecycleAges.retirementAccountCreated}, net SA savings withdrawn for investments count towards the FRS test for retirement top-ups, OA retirement transfers, and MA overflow routing. If the netSaSavingsWithdrawnForInvestments field is unavailable when relevant, projected capacity can be overstated or overflow routing can differ, and the response returns the retirement-top-up-capacity-context-missing warning.
- Under the basic-retirement-sum-with-property scenario, FRS is first transferred to RA and the eligible withdrawal to BRS is recorded as propertyPledgeWithdrawal. BRS cash plus qualifying property satisfies FRS for MA overflow, so eligible overflow routes to OA. Mandatory retirement contributions still refill RA cash principal until cohort FRS is reached.
- Annual rows expose uncreditedInterest for partial years, both RA-savings measures, topUpPotentialTaxRelief, unappliedVoluntaryTopUp, and propertyPledgeWithdrawal when applicable. The age-${rules.lifecycleAges.latestCpfLifePayoutStart} milestone is the opening checkpoint immediately before the birthday and payout-start month.
- \`cpfLifeReference\` returns the table above. Deprecated \`cpfLifeEstimate\` is always null with a migration warning.

## API v2 compatibility and errors

- Contribution input: \`contributionMonth\`, \`ordinaryWages\`, optional \`additionalWages\` with AW context, \`citizenship\`, and either completed \`age\` or \`birthMonth\`.
- Projection AW input: \`additionalWages: [{ contributionMonth, amount, additionalWageCeilingContext }]\`; the context is either \`{ annualOrdinaryWagesSubjectToCpf, priorAdditionalWagesSubjectToCpf }\` or \`{ remainingAdditionalWageCeiling }\`.
- Generic age bands that cross ${rules.lifecycleAges.retirementAccountCreated} expose age-dependent SA-to-RA routing; exact lookups resolve age ${rules.lifecycleAges.retirementAccountCreated} to RA. The deterministic age-conversion query uses \`birthMonth\` plus \`contributionMonth\`; \`birthDate\` is deprecated.
- Interest declarations return full policy metadata; \`/interest-rates/trend\` uses the \`{ observations, methodology, policy }\` envelope. SMRA calculations return methodology provenance, and missing or negative averages return 422.
- Deprecated for one compatibility cycle: contribution \`income\` → \`ordinaryWages\` and \`date\` → \`contributionMonth\`; projection \`income\`/\`age\`/\`years\` → the v2 monthly-ledger fields, \`startAge\` → exact \`birthDate\`, and \`oaToSaTransfer\` → \`retirementTransfer\`; age utility \`birthDate\` → \`birthMonth\` plus \`contributionMonth\`; interest \`sgsYield\` → \`averageSgsYield\`.
- Unsupported official policy months or years return 404. Missing AW context and other semantically incomplete requests return 422. No public reference API silently clamps or fabricates a value.
- Policy responses use \`public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400\`; policy data is never cached as year-long immutable content.

## Per-dataset provenance

| Dataset | Status | Effective from | Verified | First-party sources |
|---|---|---|---|---|
${provenanceRows()}

Catalogue version: ${CPF_POLICY_CATALOGUE.version}. This is not a global data-as-of date; each dataset and schedule above carries its own verification date and effective period.

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
