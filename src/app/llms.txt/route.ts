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
import {
  CPF_INTEREST_FLOOR_RATES,
  PEGGED_RATE_MARKUP,
} from "@/constants/cpf-interest-rates";
import { ageGroups } from "@/data";

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
  .map(([date, ceiling]) => `| ${date} | S$${ceiling.toLocaleString()} |`)
  .join("\n");

const llmsTxt = `# ${title}

> ${description}

SimplyCPF is a free, open-source CPF contribution calculator for Singapore employees and employers. It calculates CPF contributions based on monthly income, age group, and the latest income ceiling changes following Singapore's Budget 2023.

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

The CPF income ceiling is increasing progressively from S$6,000 to S$8,000 by 2026.

| Effective Date | Monthly Income Ceiling |
|---------------|----------------------|
| Pre-September 2023 | S$${CPF_INCOME_CEILING_BEFORE_SEPT_2023.toLocaleString()} |
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

## CPF Contribution Formula

For an employee with monthly income I, age group G, and ceiling C:

1. Capped Income = min(I, C) — income above the ceiling is excluded
2. Employee Contribution = Employee Rate × Capped Income
3. Employer Contribution = Employer Rate × Capped Income
4. Total CPF Contribution = Employee + Employer Contributions
5. Distribution: Total contribution is split across OA, SA, MA by the distribution rates for age group G
6. Take-home Pay = I - Employee Contribution

## Main Pages

- [Home](${BASE_URL}): CPF contribution calculator with interactive visualisation
- [Calculator](${BASE_URL}/calculator): Full-featured CPF calculator with age-based contribution rates
- [Interest Rates](${BASE_URL}/interest-rates): CPF interest rates and historical trends
- [Investments](${BASE_URL}/investments): Investment comparison tools
- [About](${BASE_URL}/about): Information about the application

## Developer Portal

- [Developer Portal](${BASE_URL}/developer): API documentation for integrating CPF calculations into applications
- [Getting Started](${BASE_URL}/developer/getting-started): Quick start guide for using the API
- [API Reference](${BASE_URL}/developer/api): Complete API documentation

## API Endpoints

- [Calculate CPF](${BASE_URL}/api/cpf/calculate): Calculate CPF contributions for a given income
- [Batch Calculate](${BASE_URL}/api/cpf/calculate/batch): Calculate CPF contributions for multiple incomes
- [Projection](${BASE_URL}/api/cpf/projection): Multi-year CPF contribution projections
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
- No sign-up, no account, no data collection
- Rates sourced from CPF Board publications
- Calculation logic is fully transparent and verifiable on GitHub
- Not affiliated with the CPF Board or any government agency
`;

export async function GET(): Promise<Response> {
  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
