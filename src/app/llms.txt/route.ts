import { BASE_URL, description, title } from "@/config";

export const revalidate = false;

export async function GET(): Promise<Response> {
  return new Response(
    `# ${title}

> ${description}

SimplyCPF is an independent, open-source planning toolkit for Singapore. It is not affiliated with CPF Board. Calculations are estimates, not financial advice or a replacement for official account statements. Check each resource's effective date and assumptions before quoting figures.

No account or API key is required. API requests are limited to 10 per 10 seconds per client IP; pause and retry after a 429 response. Use JSON request bodies for POST operations. Monetary inputs and outputs are in SGD. Never infer an endpoint or HTTP method from its name: read the OpenAPI specification first.

The homepage and documentation support Accept: text/markdown. For other tools, use the API or the reference files below; Markdown does not run the interactive calculators. Use /sitemap.xml to recover from a missing URL.

## When to use SimplyCPF

- [Contribution calculations](${BASE_URL}/openapi.json): Use POST /api/cpf/calculate to estimate employee/employer contributions, account allocation and take-home pay from income, age and date. Example JSON: {"income":5000,"age":30,"date":"2026-01-01"}. This endpoint uses full contribution rates; it does not accept graduated PR status.
- [Batch comparisons](${BASE_URL}/openapi.json): Use POST /api/cpf/calculate/batch for up to 100 income/age/date scenarios in one request, with a scenarios array.
- [Retirement projections](${BASE_URL}/openapi.json): Use POST /api/cpf/projection for career-long balances and milestones, including PR status, housing withdrawals, top-ups and transfers. Example JSON: {"monthlyIncome":5000,"startAge":30,"endAge":70,"citizenship":"citizen"}. Keep assumptions with the result; payouts are simplified estimates.
- [CPF reference data](${BASE_URL}/cpf-rates.md): Use for published contribution rates, wage ceilings, interest floors, retirement sums and BHS values. For eligibility, personal account balances or transactions, use CPF Board's official services instead.

## Developer Portal

- [Developer Portal](${BASE_URL}/docs/llms.mdx): Documentation index in Markdown.
- [Getting started](${BASE_URL}/docs/llms.mdx/getting-started): API integration guidance.
- [API reference](${BASE_URL}/docs/llms.mdx/api): API documentation index.
- [Complete documentation](${BASE_URL}/docs/llms-full.txt): Full documentation text.

## API Endpoints

- [OpenAPI 3.1 specification](${BASE_URL}/openapi.json): Machine-readable methods, inputs, responses and examples for all public CPF API operations.

## Machine-Readable Data

- [Homepage in Markdown](${BASE_URL}/index.md): Overview of SimplyCPF and its planning tools.
- [CPF rates](${BASE_URL}/cpf-rates.md): Detailed reference tables generated from application constants.
- [Extended site reference](${BASE_URL}/llms-full.txt): Detailed CPF background and links to product pages.
- [Sitemap](${BASE_URL}/sitemap.xml): Public pages and documentation URLs.

## Optional

- [Source code](https://github.com/ruchernchong/simplycpf): Implementation and calculation assumptions.
- [CPF Board](https://www.cpf.gov.sg/): Official rules, eligibility and member services.
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
