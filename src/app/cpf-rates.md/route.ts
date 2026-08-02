import {
  DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
  DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
} from "@/config";
import {
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
  getCeilingForYear,
} from "@/constants";
import { CPF_BASIC_HEALTHCARE_SUM } from "@/constants/cpf-bhs";
import {
  CPF_DATA_AS_OF_LABEL,
  CPF_DATA_AS_OF_YEAR,
} from "@/constants/cpf-data-as-of";
import {
  CPF_ACCOUNT_INTEREST_MAP,
  CPF_INTEREST_FLOOR_RATES,
  PEGGED_RATE_MARKUP,
  QUARTERLY_CPF_RATES,
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

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const contributionRows = ageGroups
  .map((g) => {
    const emp = g.contributionRate.employee;
    const empR = g.contributionRate.employer;
    return `| ${g.description} | ${fmtPct(emp)} | ${fmtPct(empR)} | ${fmtPct(emp + empR)} |`;
  })
  .join("\n");

const distributionRows = ageGroups
  .map((g) => {
    return `| ${g.description} | ${fmtPct(g.distributionRate.OA)} | ${fmtPct(g.distributionRate.SA)} | ${fmtPct(g.distributionRate.MA)} |`;
  })
  .join("\n");

const ceilingRows = Object.entries(CPF_INCOME_CEILING)
  .map(([date, ceiling]) => `| ${date} | S$${formatNumber(ceiling)} |`)
  .join("\n");

const quarterlyRows = QUARTERLY_CPF_RATES.map(
  (q) => `| ${q.quarter} | ${q.oa}% | ${q.sa}% | ${q.ma}% | ${q.ra}% |`,
).join("\n");

const prYear1Rows = permanentResidentYear1Rates
  .map(
    (g) =>
      `| ${g.description} | ${fmtPct(g.contributionRate.employee)} | ${fmtPct(g.contributionRate.employer)} |`,
  )
  .join("\n");

const prYear2Rows = permanentResidentYear2Rates
  .map(
    (g) =>
      `| ${g.description} | ${fmtPct(g.contributionRate.employee)} | ${fmtPct(g.contributionRate.employer)} |`,
  )
  .join("\n");

const retirementSumRows = Object.entries(CPF_RETIREMENT_SUMS)
  .map(
    ([year, sums]) =>
      `| ${year} | S$${formatNumber(sums.brs)} | S$${formatNumber(sums.frs)} | S$${formatNumber(sums.ers)} |`,
  )
  .join("\n");

const bhsRows = Object.entries(CPF_BASIC_HEALTHCARE_SUM)
  .map(([year, bhs]) => `| ${year} | S$${formatNumber(bhs)} |`)
  .join("\n");

const cpfRatesMd = `# CPF Rates: Machine-Readable Reference

> Source: SimplyCPF (https://simplycpf.com): All rates sourced from CPF Board publications.

## Definition: CPF

CPF (Central Provident Fund) is Singapore's mandatory social security savings scheme. Every Singapore Citizen and Permanent Resident who is employed must contribute a portion of their salary to CPF, with their employer also contributing. Contributions are distributed across three accounts: Ordinary Account (OA), Special Account (SA), and MediSave Account (MA). The rates vary by age group, and income above the CPF income ceiling is not subject to contributions.

## Definition: CPF Income Ceiling

The CPF income ceiling is the maximum amount of monthly salary subject to CPF contributions. Any income above this ceiling is not subject to CPF. Following Budget 2023, the ceiling rose in stages from S$6,000 to S$8,000, reaching S$8,000 on 1 January 2026.

---

## Contribution Rates by Age Group

| Age Group | Employee Rate | Employer Rate | Total Rate |
|-----------|--------------|--------------|-----------|
${contributionRows}

## Distribution Rates by Age Group

| Age Group | OA Rate | SA Rate | MA Rate |
|-----------|---------|---------|---------|
${distributionRows}

## Income Ceiling Timeline

| Effective Date | Monthly Ceiling |
|---------------|----------------|
| Pre-September 2023 | S$${formatNumber(CPF_INCOME_CEILING_BEFORE_SEPT_2023)} |
${ceilingRows}

## Interest Rates

### Floor Rates

| Account | Floor Rate |
|---------|-----------|
| ${CPF_ACCOUNT_INTEREST_MAP.OA} | ${CPF_INTEREST_FLOOR_RATES.OA}% p.a. |
| ${CPF_ACCOUNT_INTEREST_MAP.SMRA} | ${CPF_INTEREST_FLOOR_RATES.SMRA}% p.a. (minimum guaranteed) |

### Pegged Rate Formula (SMRA)

SMRA interest rate = max(10-year SGS 12-month average yield + ${PEGGED_RATE_MARKUP}%, ${CPF_INTEREST_FLOOR_RATES.SMRA}%)

### Quarterly Interest Rates

| Quarter | OA | SA | MA | RA |
|---------|----|----|----|----|
${quarterlyRows}

### Extra Interest Tiers

- Extra interest rate: ${CPF_EXTRA_INTEREST_RATE * 100}% on the first S$${formatNumber(CPF_EXTRA_INTEREST_CAP)} combined
- OA portion eligible for the extra interest is capped at the first S$${formatNumber(CPF_OA_EXTRA_INTEREST_CAP)}

## PR Graduated Rates

### 1st Year PR Rates

| Age Group | Employee Rate | Employer Rate |
|-----------|--------------|--------------|
${prYear1Rows}

### 2nd Year PR Rates

| Age Group | Employee Rate | Employer Rate |
|-----------|--------------|--------------|
${prYear2Rows}

## Retirement Sums

| Year | BRS | FRS | ERS |
|------|-----|-----|-----|
${retirementSumRows}

## Basic Healthcare Sum (BHS)

| Year | BHS |
|------|-----|
${bhsRows}

## CPF Contribution Formula

1. Determine the applicable income ceiling C based on the year
2. Calculate capped income: min(monthly_income, C)
3. Employee contribution = employee_rate × capped_income
4. Employer contribution = employer_rate × capped_income
5. Total contribution = employee + employer contributions
6. OA amount = total_contribution × OA_distribution_rate
7. SA amount = total_contribution × SA_distribution_rate
8. MA amount = total_contribution × MA_distribution_rate
9. Take-home pay = monthly_income - employee_contribution

## Key Statistics (${CPF_DATA_AS_OF_YEAR})

- **Default total contribution rate (age ≤ 55):** ${fmtPct(DEFAULT_EMPLOYEE_CONTRIBUTION_RATE + DEFAULT_EMPLOYER_CONTRIBUTION_RATE)} (20% employee + 17% employer)
- **Current income ceiling:** S$${formatNumber(getCeilingForYear(CPF_DATA_AS_OF_YEAR))} (from 1 January 2026, the final step of the Budget 2023 increase)
- **OA floor interest rate:** ${CPF_INTEREST_FLOOR_RATES.OA}% p.a.
- **SMRA floor interest rate:** ${CPF_INTEREST_FLOOR_RATES.SMRA}% p.a.
- **Extra interest tier:** ${CPF_EXTRA_INTEREST_RATE * 100}% on first S$${formatNumber(CPF_EXTRA_INTEREST_CAP)} (OA capped at S$${formatNumber(CPF_OA_EXTRA_INTEREST_CAP)})
- **Age brackets:** 8 (0-35, 36-45, 46-50, 51-55, 56-60, 61-65, 66-70, 70+)
- **Ceiling increase (2023-2026):** 33.3% (S$6,000 → S$8,000)

---

*Data sourced from CPF Board publications, effective ${CPF_DATA_AS_OF_LABEL}. This document is intended for machine consumption by AI agents and search engines. Visit https://simplycpf.com for the interactive calculator.*

*SimplyCPF is independent and not affiliated with the CPF Board. Figures are estimates based on published rates and are not financial advice.*
`;

export async function GET(): Promise<Response> {
  return new Response(cpfRatesMd, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
