import {
  CPF_INCOME_CEILING,
  CPF_INCOME_CEILING_BEFORE_SEPT_2023,
} from "@/constants";
import { CPF_BASIC_HEALTHCARE_SUM } from "@/constants/cpf-bhs";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import {
  CPF_ADDITIONAL_SENIOR_INTEREST_CAP,
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
import { formatNumber, formatPercentage } from "@/lib/format";

export interface CheatSheetSection {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}

export interface CheatSheetKeyAge {
  label: string;
  value: string;
}

export interface CheatSheetData {
  title: string;
  subtitle: string;
  keyAges: CheatSheetKeyAge[];
  sections: CheatSheetSection[];
}

const formatCurrency = (value: number) => `S$${formatNumber(value)}`;

export function getCpfCheatSheetData(): CheatSheetData {
  return {
    title: "SimplyCPF CPF Cheat Sheet",
    subtitle:
      "Contribution rates, account distribution, ceilings, retirement sums, and CPF planning reference points in one printable PDF.",
    keyAges: [
      { label: "RA opens, SA closes", value: "55" },
      { label: "Statutory retirement age", value: "64" },
      { label: "Re-employment age", value: "69" },
      { label: "Payout eligibility age", value: "65" },
      { label: "Latest payout start", value: "70" },
    ],
    sections: [
      {
        title: "CPF Contribution Rates by Age",
        description:
          "Employee and employer contribution rates for Singapore Citizens and PRs on full rates.",
        columns: ["Age Group", "Employee", "Employer", "Total"],
        rows: ageGroups.map((group) => [
          group.description,
          formatPercentage(group.contributionRate.employee, {
            decimalPlaces: 1,
          }),
          formatPercentage(group.contributionRate.employer, {
            decimalPlaces: 1,
          }),
          formatPercentage(
            group.contributionRate.employee + group.contributionRate.employer,
            { decimalPlaces: 1 },
          ),
        ]),
      },
      {
        title: "OA / SA / MA Distribution",
        description:
          "How the total CPF contribution is distributed across your main accounts by age group.",
        columns: ["Age Group", "OA", "SA", "MA"],
        rows: ageGroups.map((group) => [
          group.description,
          formatPercentage(group.distributionRate.OA, { decimalPlaces: 1 }),
          formatPercentage(group.distributionRate.SA, { decimalPlaces: 1 }),
          formatPercentage(group.distributionRate.MA, { decimalPlaces: 1 }),
        ]),
      },
      {
        title: "Income Ceiling Timeline",
        description:
          "The monthly wage ceiling rose progressively after Budget 2023.",
        columns: ["Effective Date", "Monthly Ceiling"],
        rows: [
          [
            "Pre-September 2023",
            formatCurrency(CPF_INCOME_CEILING_BEFORE_SEPT_2023),
          ],
          ...Object.entries(CPF_INCOME_CEILING).map(([date, ceiling]) => [
            date,
            formatCurrency(ceiling),
          ]),
        ],
      },
      {
        title: "PR Graduated Rates: Year 1",
        description:
          "The first year after becoming a Singapore Permanent Resident uses lower graduated CPF rates.",
        columns: ["Age Group", "Employee", "Employer"],
        rows: permanentResidentYear1Rates.map((group) => [
          group.description,
          formatPercentage(group.contributionRate.employee, {
            decimalPlaces: 1,
          }),
          formatPercentage(group.contributionRate.employer, {
            decimalPlaces: 1,
          }),
        ]),
      },
      {
        title: "PR Graduated Rates: Year 2",
        description:
          "The second year increases the rates again before full rates apply from Year 3 onwards.",
        columns: ["Age Group", "Employee", "Employer"],
        rows: permanentResidentYear2Rates.map((group) => [
          group.description,
          formatPercentage(group.contributionRate.employee, {
            decimalPlaces: 1,
          }),
          formatPercentage(group.contributionRate.employer, {
            decimalPlaces: 1,
          }),
        ]),
      },
      {
        title: "CPF Interest Reference",
        description:
          "Use the floor rates for conservative planning, then layer the extra interest tiers on top.",
        columns: ["Rule", "Value"],
        rows: [
          [
            "OA floor rate",
            `${formatPercentage(CPF_INTEREST_FLOOR_RATES.OA / 100, { decimalPlaces: 1 })} p.a.`,
          ],
          [
            "SA / MA / RA floor rate",
            `${formatPercentage(CPF_INTEREST_FLOOR_RATES.SMRA / 100, { decimalPlaces: 1 })} p.a.`,
          ],
          [
            "Extra interest on first combined balances",
            `${formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })} on first ${formatCurrency(CPF_EXTRA_INTEREST_CAP)}`,
          ],
          [
            "OA portion eligible for extra interest",
            `${formatCurrency(CPF_OA_EXTRA_INTEREST_CAP)}`,
          ],
          [
            "Additional interest for members aged 55+",
            `${formatPercentage(CPF_EXTRA_INTEREST_RATE, { decimalPlaces: 0 })} on first ${formatCurrency(CPF_ADDITIONAL_SENIOR_INTEREST_CAP)}`,
          ],
        ],
      },
      {
        title: "Retirement Sums",
        description:
          "Basic, Full, and Enhanced Retirement Sums used for CPF retirement planning and CPF LIFE context.",
        columns: ["Year", "BRS", "FRS", "ERS"],
        rows: Object.entries(CPF_RETIREMENT_SUMS).map(([year, sums]) => [
          year,
          formatCurrency(sums.brs),
          formatCurrency(sums.frs),
          formatCurrency(sums.ers),
        ]),
      },
      {
        title: "Basic Healthcare Sum",
        description: "BHS is the MediSave cap used in CPF healthcare planning.",
        columns: ["Year", "BHS"],
        rows: Object.entries(CPF_BASIC_HEALTHCARE_SUM).map(([year, bhs]) => [
          year,
          formatCurrency(bhs),
        ]),
      },
      {
        title: "Top-Up Limits",
        description:
          "Cash top-ups can boost retirement balances and may qualify for tax relief.",
        columns: ["Relief / Rule", "Amount"],
        rows: [
          ["Own account cash top-up relief", formatCurrency(8000)],
          ["Family account cash top-up relief", formatCurrency(8000)],
          ["Combined relief potential", formatCurrency(16000)],
          ["MRSS annual matching cap", formatCurrency(2000)],
          ["MRSS lifetime matching cap", formatCurrency(20000)],
        ],
      },
    ],
  };
}
