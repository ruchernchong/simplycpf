import { BASE_URL, description, title } from "@/config";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  CPF_POLICY_CATALOGUE,
  CPF_POLICY_VERIFIED_AT,
  POLICY_METADATA,
  POLICY_SOURCES,
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

function formatMoney(value: number): string {
  return `S$${new Intl.NumberFormat("en-SG").format(value)}`;
}

function formatPercentageFromBasisPoints(value: number): string {
  return `${(value / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

function latestScheduleRows(): string {
  const schedule = contributionSchedules.at(-1);
  if (!schedule) return "";

  return schedule.citizenRates
    .map((band) => {
      const age =
        band.maxAgeInclusive === undefined
          ? `Above ${band.minAgeExclusive}`
          : band.minAgeExclusive === undefined
            ? `${band.maxAgeInclusive} and below`
            : `Above ${band.minAgeExclusive} to ${band.maxAgeInclusive}`;
      return `| ${age} | ${formatPercentageFromBasisPoints(band.employeeBasisPoints)} | ${formatPercentageFromBasisPoints(band.employerBasisPoints)} | ${formatPercentageFromBasisPoints(band.employeeBasisPoints + band.employerBasisPoints)} |`;
    })
    .join("\n");
}

function policySourceLines(): string {
  return Object.values(POLICY_METADATA)
    .map((metadata) => {
      const links = metadata.sources
        .map((source) => `[${source.agency}: ${source.title}](${source.url})`)
        .join("; ");
      return `- ${metadata.label}: ${metadata.status}; effective from ${metadata.effectiveFrom}; verified ${metadata.verifiedAt}; ${links}`;
    })
    .join("\n");
}

const earliestSchedule = contributionSchedules[0];
const latestSchedule = contributionSchedules.at(-1);
const latestInterest = quarterlyInterestRates.at(-1);
const latestBhs = basicHealthcareSums.at(-1);
const latestRetirementSums = retirementSums.at(-1);

if (
  !earliestSchedule ||
  !latestSchedule ||
  !latestInterest ||
  !latestBhs ||
  !latestRetirementSums
) {
  throw new Error("The canonical CPF policy catalogue is incomplete.");
}

const llmsText = `# ${title}

> ${description}

SimplyCPF is an independent, open-source CPF calculation and planning site. It is not affiliated with CPF Board, IRAS, MOM, or any government agency. Its authoritative numbers come from the responsible first-party agency; its readiness rubrics, long-range projection choices, housing scenarios, and non-CPF investment returns are explicitly labelled SimplyCPF or user assumptions.

## Supported official scope

Contribution calculations cover private-sector and non-pensionable employees who are Singapore Citizens or Permanent Residents on CPF Board's default Graduated/Graduated rates. Platform workers, self-employed persons, pensionable employees, and approved alternative PR contribution arrangements are outside scope.

The official contribution catalogue covers ${earliestSchedule.effectiveFrom} through ${latestSchedule.effectiveTo}. Public reference APIs do not clamp or extrapolate unsupported dates. Projections may freeze the last published policy, but mark every affected row **assumed**.

## Latest published contribution schedule

Schedule ${latestSchedule.id}, effective ${latestSchedule.effectiveFrom} to ${latestSchedule.effectiveTo}; OW ceiling ${formatMoney(latestSchedule.ordinaryWageCeiling)} and annual AW ceiling ${formatMoney(latestSchedule.additionalWageCeiling)} before annual OW and prior-AW deductions.

| Completed age band (upper bound inclusive) | Employee | Employer | Total |
|---|---:|---:|---:|
${latestScheduleRows()}

The next rate applies only from the month after the relevant birthday. Wages of ${formatMoney(rules.wageBands.noContributionAtOrBelow)} or less attract no CPF; above ${formatMoney(rules.wageBands.noContributionAtOrBelow)} to ${formatMoney(rules.wageBands.employerOnlyAtOrBelow)} has no employee share; above ${formatMoney(rules.wageBands.employerOnlyAtOrBelow)} to ${formatMoney(rules.wageBands.phasedEmployeeShareAtOrBelow)} has a phased employee share; full rates apply above ${formatMoney(rules.wageBands.fullRatesAbove)}. Total contribution is rounded half-up to the nearest dollar, the employee share drops cents, and employer share is the remainder. MA is allocated first, SA/RA second, and OA is the exact remainder. From the ${rules.specialAccountClosure.effectiveDate.slice(0, 4)} SA closure, the retirement allocation for members ${rules.lifecycleAges.specialAccountClosed} and above goes to RA until FRS, then OA; both branches are returned if balance context is absent.

Source: [CPF Board current contribution guidance](${POLICY_SOURCES.contributionCurrent.url}), [past schedules](${POLICY_SOURCES.contributionPast.url}), and [published later changes](${POLICY_SOURCES.contribution2027.url}). Contribution catalogue verified ${CPF_POLICY_VERIFIED_AT}.

## Official reference facts

- Published BHS runs through ${latestBhs.year}: ${formatMoney(latestBhs.amount)}. A member's BHS freezes when they turn ${rules.lifecycleAges.cpfLifePayoutEligibility}. [CPF Board source](${POLICY_SOURCES.basicHealthcareSum.url}).
- Published retirement sums run through ${latestRetirementSums.year}: BRS ${formatMoney(latestRetirementSums.brs)}, FRS ${formatMoney(latestRetirementSums.frs)}, ERS ${formatMoney(latestRetirementSums.ers)}. [CPF Board source](${POLICY_SOURCES.retirementSums.url}).
- OA has a ${interestRateMethodology.ordinaryAccount.floorRate}% floor and is reviewed quarterly against the three-month local-bank average. SMRA is reviewed quarterly using the 12-month average 10-year SGS yield plus ${interestRateMethodology.specialMediSaveRetirementAccounts.markupPercentagePoints} percentage point, subject to the current ${interestRateMethodology.specialMediSaveRetirementAccounts.floorRate}% floor through ${interestRateMethodology.specialMediSaveRetirementAccounts.floorGuaranteedThrough.slice(0, 4)}. [CPF Board methodology](${POLICY_SOURCES.interestMethodology.url}).
- The latest loaded declaration is ${latestInterest.quarter}, effective ${latestInterest.effectiveFrom} to ${latestInterest.effectiveTo}: OA ${latestInterest.oa}%, SA ${latestInterest.sa}%, MA ${latestInterest.ma}%, RA ${latestInterest.ra}%. [CPF Board declaration](${latestInterest.sourceUrl}).
- CPF LIFE output is CPF Board's exact ${cpfLife.reference.year} reference table for a ${cpfLife.reference.profile} member on the ${cpfLife.reference.plan} Plan. SimplyCPF does not interpolate it. [Reference table](${POLICY_SOURCES.cpfLifeReferencePayouts.url}); [personalised CPF Board planner](${cpfLife.reference.personalisedEstimatorUrl}). ${formatMoney(cpfLife.automaticInclusion.minimumRetirementSavingsAtPayoutStart)} is an automatic-inclusion condition for certain cohorts, not a payout or joining minimum.
- IRAS CPF Cash Top-up Relief can be up to ${formatMoney(rules.retirementTopUps.taxRelief.selfAnnualCap)} for self and ${formatMoney(rules.retirementTopUps.taxRelief.familyAnnualCap)} for family, subject to its conditions and overall relief cap. It is not the actual CPF top-up limit. [IRAS source](${POLICY_SOURCES.irasCashTopUpRelief.url}).
- Pre-55 net SA savings withdrawn for investments count towards the FRS limit. Omitting the netSaSavingsWithdrawnForInvestments field when relevant can overstate projected top-up or transfer capacity and returns the retirement-top-up-capacity-context-missing warning.
- From ${rules.statutoryEmploymentAges.effectiveDate}, the statutory retirement age is ${rules.statutoryEmploymentAges.retirementAge} and re-employment age is ${rules.statutoryEmploymentAges.reEmploymentAge}, subject to cohort rules. [MOM source](${POLICY_SOURCES.momRetirementAges.url}).

## API v2.0.0

- \`POST /api/cpf/calculate\`: send \`contributionMonth\`, \`ordinaryWages\`, optional \`additionalWages\` plus annual OW/prior-AW context, \`citizenship\`, and either completed \`age\` or \`birthMonth\`. Responses add wage band, schedule, routing, warnings, and provenance.
- \`POST /api/cpf/calculate/batch\`: same contract for up to 100 scenarios.
- \`POST /api/cpf/projection\`: send \`startMonth\`, starting OA/SA/MA/RA balances, birth month, income, citizenship, and options; SPR Year 1/2 requests should also send \`permanentResidentSince\` so G/G schedule anniversaries can be resolved. It returns monthly-ledger annual snapshots, per-year \`official | assumed\` policy markers, assumptions, and CPF LIFE reference rows. Deprecated \`cpfLifeEstimate\` is null.
- \`GET /api/cpf/age-groups\`: inclusive upper bounds and explicit age-dependent SA-to-RA routing when a generic band crosses 55. \`/age-group/find\` resolves an exact post-closure age 55 to RA. \`/age/from-birthdate\` accepts deterministic \`birthMonth\` plus \`contributionMonth\`; \`birthDate\` is deprecated.
- \`GET /api/cpf/ceiling\`, \`/bhs\`, and \`/retirement-sums\`: only sourced official dates; unsupported policy years return 404.
- \`GET /api/cpf/interest-rates\`: official quarterly declarations, published methodology, and full dataset metadata. \`/interest-rates/trend\` returns \`{ observations, methodology, policy }\`. There is no synthetic monthly SGS series.
- \`GET /api/cpf/interest-rates/smra?averageSgsYield=...\`: applies the published 12-month-average peg.
- \`POST /api/cpf/investment-comparison\`: non-CPF rates are editable caller assumptions, not CPF Board forecasts.

Deprecated for one compatibility cycle: contribution \`income\` → \`ordinaryWages\` and \`date\` → \`contributionMonth\`; projection \`income\`/\`age\`/\`years\` → the v2 monthly-ledger fields, \`startAge\` → exact \`birthDate\`, and \`oaToSaTransfer\` → \`retirementTransfer\`; interest query \`sgsYield\` → \`averageSgsYield\`. Missing AW context returns 422. Public policy dates without a sourced schedule return 404.

Policy responses cache at the edge for 24 hours with stale revalidation and are never marked immutable for a year.

## Main resources

- [Calculator](${BASE_URL}/calculator)
- [Monthly projection](${BASE_URL}/projection)
- [CPF LIFE official reference](${BASE_URL}/cpf-life)
- [Interest declarations](${BASE_URL}/interest-rates)
- [Machine-readable CPF policy reference](${BASE_URL}/cpf-rates.md)
- [API v2 OpenAPI document](${BASE_URL}/openapi.json)
- [Developer portal](${BASE_URL}/developer)
- [Full developer documentation](${BASE_URL}/docs/llms-full.txt)

## Per-dataset first-party provenance

${policySourceLines()}

The catalogue was verified ${CPF_POLICY_VERIFIED_AT}; this is not a universal effective date. Each dataset above has its own effective period. Figures are not financial advice.
`;

export async function GET(): Promise<Response> {
  return new Response(llmsText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...CACHE_HEADERS.policy,
    },
  });
}
