import { BASE_URL, description, title } from "@/config";
import { CPF_BASIC_HEALTHCARE_SUM } from "@/constants/cpf-bhs";
import {
  CPF_INTEREST_FLOOR_RATES,
  CPF_INTEREST_RATE_METHODOLOGY,
  QUARTERLY_CPF_RATES,
} from "@/constants/cpf-interest-rates";
import { CPF_LIFE_2026_REFERENCE } from "@/constants/cpf-life";
import { CPF_RETIREMENT_SUMS } from "@/constants/cpf-retirement-sums";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import {
  CPF_CONTRIBUTION_SCHEDULES,
  CPF_POLICY_VERIFIED_AT,
  POLICY_METADATA,
} from "@/policy";

export const revalidate = 86400;

function formatMoney(value: number): string {
  return `S$${new Intl.NumberFormat("en-SG").format(value)}`;
}

function formatPercentageFromBasisPoints(value: number): string {
  return `${(value / 100).toFixed(2).replace(/\.00$/, "")}%`;
}

function latestScheduleRows(): string {
  const schedule = CPF_CONTRIBUTION_SCHEDULES.at(-1);
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

const latestSchedule = CPF_CONTRIBUTION_SCHEDULES.at(-1);
const latestInterest = QUARTERLY_CPF_RATES.at(-1);
const latestBhsYear = Math.max(
  ...Object.keys(CPF_BASIC_HEALTHCARE_SUM).map(Number),
);
const latestRetirementYear = Math.max(
  ...Object.keys(CPF_RETIREMENT_SUMS).map(Number),
);

const llmsText = `# ${title}

> ${description}

SimplyCPF is an independent, open-source CPF calculation and planning site. It is not affiliated with CPF Board, IRAS, MOM, or any government agency. Its authoritative numbers come from the responsible first-party agency; its readiness rubrics, long-range projection choices, housing scenarios, and non-CPF investment returns are explicitly labelled SimplyCPF or user assumptions.

## Supported official scope

Contribution calculations cover private-sector and non-pensionable employees who are Singapore Citizens or Permanent Residents on CPF Board's default Graduated/Graduated rates. Platform workers, self-employed persons, pensionable employees, and approved alternative PR contribution arrangements are outside scope.

The official contribution catalogue covers January 2023 through December 2027. Public reference APIs do not clamp or extrapolate unsupported dates. Projections may freeze the last published policy, but mark every affected row **assumed**.

## Latest published contribution schedule

${latestSchedule ? `Schedule ${latestSchedule.id}, effective ${latestSchedule.effectiveFrom} to ${latestSchedule.effectiveTo}; OW ceiling ${formatMoney(latestSchedule.ordinaryWageCeiling)} and annual AW ceiling ${formatMoney(latestSchedule.additionalWageCeiling)} before annual OW and prior-AW deductions.` : "No schedule loaded."}

| Completed age band (upper bound inclusive) | Employee | Employer | Total |
|---|---:|---:|---:|
${latestScheduleRows()}

The next rate applies only from the month after the relevant birthday. Wages of S$50 or less attract no CPF; above S$50 to S$500 has no employee share; above S$500 to S$750 has a phased employee share; full rates apply above S$750. Total contribution is rounded half-up to the nearest dollar, the employee share drops cents, and employer share is the remainder. MA is allocated first, SA/RA second, and OA is the exact remainder. From the 2025 SA closure, the retirement allocation for members 55 and above goes to RA until FRS, then OA; both branches are returned if balance context is absent.

Source: [CPF Board current contribution guidance](https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay), [past schedules](https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay/past-cpf-contribution-and-allocation-rates), and [2027 changes](https://www.cpf.gov.sg/employer/infohub/news/cpf-related-announcements/new-contribution-rates). Contribution catalogue verified ${CPF_POLICY_VERIFIED_AT}.

## Official reference facts

- Published BHS runs through ${latestBhsYear}: ${formatMoney(CPF_BASIC_HEALTHCARE_SUM[String(latestBhsYear)])}. A member's BHS freezes when they turn 65. [CPF Board source](https://www.cpf.gov.sg/service/article/what-is-the-basic-healthcare-sum).
- Published retirement sums run through ${latestRetirementYear}: BRS ${formatMoney(CPF_RETIREMENT_SUMS[String(latestRetirementYear)].brs)}, FRS ${formatMoney(CPF_RETIREMENT_SUMS[String(latestRetirementYear)].frs)}, ERS ${formatMoney(CPF_RETIREMENT_SUMS[String(latestRetirementYear)].ers)}. [CPF Board source](https://www.cpf.gov.sg/member/infohub/educational-resources/what-is-the-cpf-retirement-sum).
- OA has a ${CPF_INTEREST_FLOOR_RATES.OA}% floor and is reviewed quarterly against the three-month local-bank average. SMRA is reviewed quarterly using the 12-month average 10-year SGS yield plus one percentage point, subject to the current ${CPF_INTEREST_FLOOR_RATES.SMRA}% floor through 2026. [CPF Board methodology](${CPF_INTEREST_RATE_METHODOLOGY.sourceUrl}).
- ${latestInterest ? `The latest loaded declaration is ${latestInterest.quarter}, effective ${latestInterest.effectiveFrom} to ${latestInterest.effectiveTo}: OA ${latestInterest.oa}%, SA ${latestInterest.sa}%, MA ${latestInterest.ma}%, RA ${latestInterest.ra}%. [CPF Board declaration](${latestInterest.sourceUrl}).` : "No quarterly declaration loaded."}
- CPF LIFE output is CPF Board's exact ${CPF_LIFE_2026_REFERENCE.referenceYear} reference table for a ${CPF_LIFE_2026_REFERENCE.profile} member on the ${CPF_LIFE_2026_REFERENCE.plan} Plan. SimplyCPF does not interpolate it. [Reference table](${CPF_LIFE_2026_REFERENCE.sourceUrl}); [personalised CPF Board planner](${CPF_LIFE_2026_REFERENCE.personalisedEstimatorUrl}). S$60,000 is an automatic-inclusion condition for certain cohorts, not a payout or joining minimum.
- IRAS CPF Cash Top-up Relief can be up to S$8,000 for self and S$8,000 for family, subject to its conditions and overall relief cap. It is not the actual CPF top-up limit. [IRAS source](https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund-%28cpf%29-cash-top-up-relief).
- From 1 July 2026, the statutory retirement age is 64 and re-employment age is 69, subject to cohort rules. [MOM source](https://www.mom.gov.sg/employment-practices/re-employment).

## API v2.0.0

- \`POST /api/cpf/calculate\`: send \`contributionMonth\`, \`ordinaryWages\`, optional \`additionalWages\` plus annual OW/prior-AW context, \`citizenship\`, and either completed \`age\` or \`birthMonth\`. Responses add wage band, schedule, routing, warnings, and provenance.
- \`POST /api/cpf/calculate/batch\`: same contract for up to 100 scenarios.
- \`POST /api/cpf/projection\`: send \`startMonth\`, starting OA/SA/MA/RA balances, birth month, income, citizenship, and options. It returns monthly-ledger annual snapshots, per-year \`official | assumed\` policy markers, assumptions, and CPF LIFE reference rows. Deprecated \`cpfLifeEstimate\` is null.
- \`GET /api/cpf/age-groups\` and \`GET /api/cpf/age-group/find\`: inclusive upper age bounds and explicit RA after SA closure.
- \`GET /api/cpf/ceiling\`, \`/bhs\`, and \`/retirement-sums\`: only sourced official dates; unsupported policy years return 404.
- \`GET /api/cpf/interest-rates\` and \`/interest-rates/trend\`: official quarterly declarations only; no synthetic monthly SGS series.
- \`GET /api/cpf/interest-rates/smra?averageSgsYield=...\`: applies the published 12-month-average peg.
- \`POST /api/cpf/investment-comparison\`: non-CPF rates are editable caller assumptions, not CPF Board forecasts.

Deprecated for one compatibility cycle: \`income\` → \`ordinaryWages\`, \`date\` → \`contributionMonth\`, \`oaToSaTransfer\` → \`retirementTransfer\`, and interest query \`sgsYield\` → \`averageSgsYield\`. Missing AW context returns 422. Public policy dates without a sourced schedule return 404.

Policy responses cache at the edge for 24 hours with stale revalidation and are never marked immutable for a year.

## Main resources

- [Calculator](${BASE_URL}/calculator)
- [Monthly projection](${BASE_URL}/projection)
- [CPF LIFE official reference](${BASE_URL}/cpf-life)
- [Interest declarations](${BASE_URL}/interest-rates)
- [Machine-readable CPF policy reference](${BASE_URL}/cpf-rates.md)
- [OpenAPI v2 contract](${BASE_URL}/openapi.json)
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
