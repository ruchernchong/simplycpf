import { BASE_URL } from "@/config";
import { CPF_INCOME_CEILING } from "@/constants";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { getRetirementSumsForYear } from "@/constants/cpf-retirement-sums";
import { markdownResponse } from "@/lib/markdown-response";

export const revalidate = false;

export function GET(): Response {
  const { brs, frs, ers } = getRetirementSumsForYear(2026);
  return markdownResponse(`# SimplyCPF

> Five questions about CPF, answered in plain English.

Where this month's money went. What happens at 55. What a flat really costs your OA. What arrives every month at 65. No sign-up, no jargon, no advice, just the arithmetic, with every assumption shown.

## Calculate your contributions

The interactive homepage accepts monthly salary, date of birth and citizenship status. It shows employee and employer contributions, take-home pay and account allocations. Personalised results require inputs; this Markdown page is an overview, not a calculated result. Use the [calculator](${BASE_URL}/calculator) or the [API specification](${BASE_URL}/openapi.json) for calculations.

## Reference figures for 2026

- OA floor interest: ${CPF_INTEREST_FLOOR_RATES.OA}% per annum.
- SA, MA and RA floor interest: ${CPF_INTEREST_FLOOR_RATES.SMRA}% per annum, with extra interest tiers.
- Monthly ordinary wage ceiling from January 2026: SGD ${CPF_INCOME_CEILING["2026-01-01"]}.
- Basic Retirement Sum: SGD ${brs}; Full Retirement Sum: SGD ${frs}; Enhanced Retirement Sum: SGD ${ers}.
- [Rates and assumptions](${BASE_URL}/cpf-rates.md)

## Questions and tools

- [What happens at 55?](${BASE_URL}/cpf-at-55): Explore the SA closure and RA/OA split.
- [What does a flat cost my OA?](${BASE_URL}/accrued-interest): Illustrate accrued interest on OA housing withdrawals.
- [Which CPF LIFE plan is which?](${BASE_URL}/cpf-life): Compare payout shapes and deferment options.
- [Why did my January take-home pay change?](${BASE_URL}/calculator): Understand the ordinary wage ceiling and contributions.
- [Project balances](${BASE_URL}/projection): Explore balances across a career.
- [Compare scenarios](${BASE_URL}/what-if): Explore salary changes, top-ups and transfers.
- [Check your CPF knowledge](${BASE_URL}/cpf-check)
- [CPF cheat sheet](${BASE_URL}/cpf-cheat-sheet)

SimplyCPF is independent and not affiliated with CPF Board. Figures are estimates, not financial advice.

## For agents

- [When to use SimplyCPF](${BASE_URL}/llms.txt)
- [Documentation](${BASE_URL}/docs)
- [Sitemap](${BASE_URL}/sitemap.xml)
`);
}
