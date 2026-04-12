import { vi } from "vitest";
import {
  DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
  DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
} from "@/config";
import type { ComputedResult } from "@/types";
import { calculateCpfContribution } from "../calculate-cpf-contribution";

// Mock the config and constants modules
vi.mock("@/config", () => ({
  DEFAULT_EMPLOYEE_CONTRIBUTION_RATE: 0.2,
  DEFAULT_EMPLOYER_CONTRIBUTION_RATE: 0.17,
  CPF_TYPE: {
    OA: "OA",
    SA: "SA",
    MA: "MA",
  },
}));

vi.mock("@/constants", () => ({
  CPF_INCOME_CEILING: {
    "2023-01-01": 6000,
    "2023-09-01": 6300,
    "2024-01-01": 6800,
    "2025-01-01": 7400,
    "2026-01-01": 8000,
  },
  CPF_INCOME_CEILING_BEFORE_SEPT_2023: 6000,
  DEFAULT_CPF_INCOME_CEILING: 6000,
}));

type TestCase = {
  effectiveDate: string;
  income: number;
  expected: ComputedResult;
};

const testCases: TestCase[] = [
  {
    effectiveDate: "2023-01-01",
    income: 4000,
    expected: {
      contribution: {
        employee: 800,
        employer: 680,
        totalContribution: 1480,
      },
      distribution: {
        OA: 920.12,
        SA: 239.91,
        MA: 319.98,
      },
      afterCpfContribution: 3200,
    },
  },
  {
    effectiveDate: "2023-01-01",
    income: 6000,
    expected: {
      contribution: {
        employee: 1200,
        employer: 1020,
        totalContribution: 2220,
      },
      distribution: {
        MA: 479.96,
        OA: 1380.17,
        SA: 359.86,
      },
      afterCpfContribution: 4800,
    },
  },
  {
    effectiveDate: "2023-01-01",
    income: 8000,
    expected: {
      contribution: {
        employee: 1200,
        employer: 1020,
        totalContribution: 2220,
      },
      distribution: {
        OA: 1380.17,
        SA: 359.86,
        MA: 479.96,
      },
      afterCpfContribution: 6800,
    },
  },
  {
    effectiveDate: "2026-01-01",
    income: 4000,
    expected: {
      contribution: {
        employee: 800,
        employer: 680,
        totalContribution: 1480,
      },
      distribution: {
        OA: 920.12,
        SA: 239.91,
        MA: 319.98,
      },
      afterCpfContribution: 3200,
    },
  },
  {
    effectiveDate: "2026-01-01",
    income: 6000,
    expected: {
      contribution: {
        employee: 1200,
        employer: 1020,
        totalContribution: 2220,
      },
      distribution: {
        OA: 1380.17,
        SA: 359.86,
        MA: 479.96,
      },
      afterCpfContribution: 4800,
    },
  },
  {
    effectiveDate: "2026-01-01",
    income: 8000,
    expected: {
      contribution: {
        employee: 1600,
        employer: 1360,
        totalContribution: 2960,
      },
      distribution: {
        MA: 639.95,
        OA: 1840.23,
        SA: 479.82,
      },
      afterCpfContribution: 6400,
    },
  },
  {
    effectiveDate: "2026-01-01",
    income: 10000,
    expected: {
      contribution: {
        employee: 1600,
        employer: 1360,
        totalContribution: 2960,
      },
      distribution: {
        OA: 1840.23,
        SA: 479.82,
        MA: 639.95,
      },
      afterCpfContribution: 8400,
    },
  },
];

const testAgeGroup = {
  description: "55 and below",
  minAge: 0,
  maxAge: 35,
  contributionRate: {
    employee: DEFAULT_EMPLOYEE_CONTRIBUTION_RATE,
    employer: DEFAULT_EMPLOYER_CONTRIBUTION_RATE,
  },
  distributionRate: { OA: 0.6217, SA: 0.1621, MA: 0.2162 },
};

describe("calculateCpfContribution", () => {
  it.each(
    testCases,
  )("should return the expected income after CPF contribution in $effectiveDate on a gross income of $income", ({
    effectiveDate,
    income,
    expected,
  }) => {
    expect(
      calculateCpfContribution(income, effectiveDate, {
        ageGroup: testAgeGroup,
      }),
    ).toEqual(expected);
  });

  it("should return the income after CPF contribution before the ceiling changes", () => {
    expect(
      calculateCpfContribution(6000, "2023-01-01", {
        useCeilingBeforeSep2023: true,
      }),
    ).toEqual({
      contribution: { employee: 1200, employer: 1020, totalContribution: 2220 },
      distribution: {},
      afterCpfContribution: 4800,
    });
    expect(
      calculateCpfContribution(8000, "2023-01-01", {
        useCeilingBeforeSep2023: true,
      }),
    ).toEqual({
      contribution: { employee: 1200, employer: 1020, totalContribution: 2220 },
      distribution: {},
      afterCpfContribution: 6800,
    });
  });

  it("should return the result correctly for a certain age group", () => {
    expect(
      calculateCpfContribution(6000, "2023-01-01", {
        ageGroup: {
          description: "Above 70",
          minAge: 70,
          contributionRate: { employee: 0.05, employer: 0.075 },
          distributionRate: { OA: 0.08, SA: 0.08, MA: 0.84 },
        },
      }),
    ).toEqual({
      contribution: { employee: 300, employer: 450, totalContribution: 750 },
      distribution: {
        OA: 60,
        SA: 60,
        MA: 630,
      },
      afterCpfContribution: 5700,
    });
  });

  it("should use default rates when no options are provided", () => {
    expect(calculateCpfContribution(5000, "2023-01-01")).toEqual({
      contribution: {
        employee: 1000,
        employer: 850,
        totalContribution: 1850,
      },
      distribution: {},
      afterCpfContribution: 4000,
    });
  });
});
