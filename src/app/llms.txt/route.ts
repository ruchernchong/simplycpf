import {
  BASE_URL,
  DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
  DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
  description,
  title,
} from "@/config";
import {
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
} from "@/constants";
import { CPF_BASIC_HEALTHCARE_SUM } from "@/constants/cpf-bhs";
import { CPF_DATA_AS_OF_LABEL } from "@/constants/cpf-data-as-of";
import {
  CPF_INTEREST_FLOOR_RATES,
  PEGGED_RATE_MARKUP,
} from "@/constants/cpf-interest-rates";
import {
  CPF_EXTRA_INTEREST_CAP,
  CPF_EXTRA_INTEREST_RATE,
  CPF_OA_EXTRA_INTEREST_CAP,
} from "@/constants/cpf-interest-tiers";
import { CPF_RETIREMENT_SUMS } from "@/constants/cpf-retirement-sums";
import { ageGroups } from "@/data";
import {
  permanentResidentYear1Rates,
  permanentResidentYear2Rates,
} from "@/data/permanent-resident-rates";
import { formatNumber } from "@/lib/format";

export const revalidate = false;

const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const contributionRatesSection = ageGroups
  .map((g) => {
    const emp = g.contributionRate.employee;
    const empR = g.contributionRate.employer;
    const total = emp + empR;
    return `| ${g.description} | ${formatPct(emp)} | ${formatPct(empR)} | ${formatPct(total)} |`;
  })
  .join("\n");

const distributionRatesSection = ageGroups
  .map((g) => {
    const oa = g.distributionRate.OA;
    const sa = g.distributionRate.SA;
    const ma = g.distributionRate.MA;
    return `| ${g.description} | ${formatPct(oa)} | ${formatPct(sa)} | ${formatPct(ma)} |`;
  })
  .join("\n");

const ceilingEntries = Object.entries(CPF_INCOME_CEILING)
  .map(([date, ceiling]) => `| ${date} | S$${formatNumber(ceiling)} |`)
  .join("\n");

const prYear1Section = permanentResidentYear1Rates
  .map(
    (g) =>
      `| ${g.description} | ${formatPct(g.contributionRate.employee)} | ${formatPct(g.contributionRate.employer)} |`,
  )
  .join("\n");

const prYear2Section = permanentResidentYear2Rates
  .map(
    (g) =>
      `| ${g.description} | ${formatPct(g.contributionRate.employee)} | ${formatPct(g.contributionRate.employer)} |`,
  )
  .join("\n");

const retirementSumsSection = Object.entries(CPF_RETIREMENT_SUMS)
  .map(
    ([year, sums]) =>
      `| ${year} | S$${formatNumber(sums.brs)} | S$${formatNumber(sums.frs)} | S$${formatNumber(sums.ers)} |`,
  )
  .join("\n");

const bhsSection = Object.entries(CPF_BASIC_HEALTHCARE_SUM)
  .map(([year, bhs]) => `| ${year} | S$${formatNumber(bhs)} |`)
  .join("\n");

const llmsTxt = `# ${title}

> ${description}

SimplyCPF is a free, open-source CPF calculator and planning toolkit for Singapore employees and Permanent Residents. It covers CPF contributions, projection modelling, what-if scenarios, CPF LIFE estimates, and quick reference resources built from CPF Board rates.

## What is CPF?

CPF (Central Provident Fund) is Singapore's mandatory savings scheme for Citizens and Permanent Residents. Both employees and employers contribute a percentage of the employee's monthly salary to CPF, which is distributed across three accounts: Ordinary Account (OA), Special Account (SA), and MediSave Account (MA). Contribution rates and distribution vary by age group, and income above the ceiling is not subject to CPF contributions.

## CPF Contribution Rates by Age Group

| Age Group | Employee | Employer | Total |
|-----------|----------|----------|-------|
${contributionRatesSection}

- Employees aged 55 and below: ${formatPct(DEFAULT_EMPLOYEE_CONTRIBUTION_RATE)} employee + ${formatPct(DEFAULT_EMPLOYER_CONTRIBUTION_RATE)} employer = ${formatPct(DEFAULT_EMPLOYEE_CONTRIBUTION_RATE + DEFAULT_EMPLOYER_CONTRIBUTION_RATE)} total
- Contribution rates decrease for older age groups
- All rates are sourced from CPF Board publications

## CPF Distribution Rates by Age Group

| Age Group | OA | SA | MA |
|-----------|----|----|----|
${distributionRatesSection}

- Younger workers have more allocated to OA (housing, education, investment)
- Older workers see more going to SA (retirement) and MA (healthcare)
- Distribution rates are applied to the total CPF contribution amount

## CPF Income Ceiling Timeline (Budget 2023)

The CPF income ceiling rose in stages from S$6,000 to S$8,000, reaching S$8,000 on 1 January 2026.

| Effective Date | Monthly Income Ceiling |
|---------------|----------------------|
| Pre-September 2023 | S$${formatNumber(CPF_INCOME_CEILING_BEFORE_SEPT_2023)} |
${ceilingEntries}

- Income above the ceiling is NOT subject to CPF contributions
- Higher-income earners will see more of their salary subject to CPF as the ceiling rises
- Employee contributions increase, take-home pay decreases slightly, but total retirement savings increase

## CPF Interest Rates

| Account | Floor Rate | Pegged Rate Formula |
|---------|-----------|-------------------|
| Ordinary Account (OA) | ${CPF_INTEREST_FLOOR_RATES.OA}% p.a. | Fixed (not pegged to SGS) |
| Special, MediSave & Retirement Accounts (SMRA) | ${CPF_INTEREST_FLOOR_RATES.SMRA}% p.a. | 10-year SGS yield + ${PEGGED_RATE_MARKUP}% OR floor rate, whichever is higher |

- OA earns a guaranteed minimum of ${CPF_INTEREST_FLOOR_RATES.OA}% per annum
- SMRA earns a guaranteed minimum of ${CPF_INTEREST_FLOOR_RATES.SMRA}% per annum, with potential to earn more when market rates are higher
- The pegged rate is based on the 12-month average yield of 10-year Singapore Government Securities (SGS) plus ${PEGGED_RATE_MARKUP}%

## CPF Extra Interest Tiers

- Extra interest rate: ${CPF_EXTRA_INTEREST_RATE * 100}% on the first S$${formatNumber(CPF_EXTRA_INTEREST_CAP)} combined
- OA portion eligible for the extra interest is capped at the first S$${formatNumber(CPF_OA_EXTRA_INTEREST_CAP)}
- After age 55, the extra interest on the OA portion is redirected to the Retirement Account

## CPF Retirement Sums

| Year | BRS | FRS | ERS |
|------|-----|-----|-----|
${retirementSumsSection}

## Basic Healthcare Sum (BHS)

| Year | BHS |
|------|-----|
${bhsSection}

## PR Graduated CPF Rates

### 1st Year PR

| Age Group | Employee | Employer |
|-----------|----------|----------|
${prYear1Section}

### 2nd Year PR

| Age Group | Employee | Employer |
|-----------|----------|----------|
${prYear2Section}

## CPF Contribution Formula

For an employee with monthly income I, age group G, and ceiling C:

1. Capped Income = min(I, C), income above the ceiling is excluded
2. Employee Contribution = Employee Rate × Capped Income
3. Employer Contribution = Employer Rate × Capped Income
4. Total CPF Contribution = Employee + Employer Contributions
5. Distribution: Total contribution is split across OA, SA, MA by the distribution rates for age group G
6. Take-home Pay = I - Employee Contribution

## Main Pages

- [Home](${BASE_URL}): CPF contribution calculator with interactive visualisation
- [Calculator](${BASE_URL}/calculator): Full-featured CPF calculator with age-based contribution rates
- [Projection](${BASE_URL}/projection): Career-long CPF projection with age 55, 65, and 70 milestones
- [What-If](${BASE_URL}/what-if): Compare salary changes, top-ups, OA to SA transfers, and delayed starts
- [CPF LIFE](${BASE_URL}/cpf-life): Estimate CPF LIFE payouts from your Retirement Account balance
- [CPF Cheat Sheet](${BASE_URL}/cpf-cheat-sheet): Download a printable CPF reference sheet with rates, sums, ceilings, and PR transitions
- [Retirement Readiness Score](${BASE_URL}/retirement-readiness): Answer 5 quick questions to see which CPF planning gap to tackle next
- [Interest Rates](${BASE_URL}/interest-rates): CPF interest rates and historical trends
- [Investments](${BASE_URL}/investments): Investment comparison tools
- [About](${BASE_URL}/about): Information about the application
- [Privacy](${BASE_URL}/privacy): Privacy and optional email-delivery disclosure

## FAQ

- [FAQ Index](${BASE_URL}/faq): Common questions about CPF contributions, projections, CPF LIFE, and retirement planning
- [General CPF Questions](${BASE_URL}/faq/general): Essential CPF concepts, interest rates, account types, and how SimplyCPF works
- [Contribution Rates](${BASE_URL}/faq/contribution-rates): CPF contribution calculations, income ceilings, and age-based rates
- [Career Projection](${BASE_URL}/faq/projection): Long-term CPF balance projections, milestones, and CPF LIFE estimates
- [CPF LIFE](${BASE_URL}/faq/cpf-life): Monthly payouts, plan types, deferment options, and retirement sums

## Developer Portal

- [Developer Portal](${BASE_URL}/docs): API documentation for integrating CPF calculations into applications
- [Getting Started](${BASE_URL}/docs/getting-started): Quick start guide for using the API
- [API Reference](${BASE_URL}/docs/api): Complete API documentation

## API Endpoints

- [Calculate CPF](${BASE_URL}/api/cpf/calculate): Calculate CPF contributions for a given income
- [Batch Calculate](${BASE_URL}/api/cpf/calculate/batch): Calculate CPF contributions for multiple incomes
- [Projection](${BASE_URL}/api/cpf/projection): Full CPF balance projections with milestones, interest, and CPF LIFE estimates
- [Retirement Sums](${BASE_URL}/api/cpf/retirement-sums): BRS, FRS, and ERS data by year
- [Basic Healthcare Sum](${BASE_URL}/api/cpf/bhs): BHS data by year
- [Age Groups](${BASE_URL}/api/cpf/age-groups): Get all CPF contribution rates by age bracket
- [Find Age Group](${BASE_URL}/api/cpf/age-group/find): Find the applicable age group for a specific age
- [Age from Birthdate](${BASE_URL}/api/cpf/age/from-birthdate): Calculate age from a birthdate
- [Income Ceiling](${BASE_URL}/api/cpf/ceiling): Get current CPF income ceiling
- [Ceiling Timeline](${BASE_URL}/api/cpf/ceiling/timeline): Get historical income ceiling changes
- [Interest Rates](${BASE_URL}/api/cpf/interest-rates): Get current CPF interest rates
- [SMRA Calculator](${BASE_URL}/api/cpf/interest-rates/smra): Calculate Special/MediSave/Retirement Account weighted average
- [Interest Rate Trend](${BASE_URL}/api/cpf/interest-rates/trend): Get historical interest rate data
- [Investment Comparison](${BASE_URL}/api/cpf/investment-comparison): Compare investment scenarios

## Machine-Readable Data

- [CPF Rates (Markdown)](${BASE_URL}/cpf-rates.md): Complete CPF contribution rates, distribution rates, interest rates, and ceiling timeline in machine-readable markdown
- [LLMs Full Text](${BASE_URL}/docs/llms-full.txt): Complete documentation content in plain text format for LLMs

## About SimplyCPF

- Free and open-source (MIT licence)
- Core tools work without sign-up or an account
- Email is only requested when a user asks for a CPF resource or report
- Rates sourced from CPF Board publications, effective ${CPF_DATA_AS_OF_LABEL}
- Calculation logic is fully transparent and verifiable on GitHub
- Not affiliated with the CPF Board or any government agency

## Currency and Disclaimer

All rates, ceilings, retirement sums and Basic Healthcare Sum values on this page are effective ${CPF_DATA_AS_OF_LABEL}.

SimplyCPF is independent and not affiliated with the CPF Board. Figures are estimates based on published rates and are not financial advice.
`;

export async function GET(): Promise<Response> {
  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
