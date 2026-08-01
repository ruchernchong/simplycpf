import type {
  ContributionAgeBandId,
  ContributionCitizenship,
} from "../contributions";
import { POLICY_SOURCES } from "../sources";

export interface ContributionGoldenFixture {
  contributionMonth: string;
  ordinaryWages: number;
  age: number;
  citizenship: ContributionCitizenship;
  ageBand: ContributionAgeBandId;
  total: number;
  employee: number;
  employer: number;
  source: string;
}

export interface CpfBoardCalculatorRegressionFixture {
  birthMonth: string;
  contributionMonth: string;
  ordinaryWages: number;
  citizenship: ContributionCitizenship;
  total: number;
  employee: number;
  employer: number;
  sourceUrl: string;
  calculatorUrl: string;
  calculatorLabel: "CPF Board CPF contribution calculator";
  verifiedAt: "2026-08-01";
  note: string;
}

export interface WageBandBoundaryGoldenFixture {
  ordinaryWages: number;
  citizenship: ContributionCitizenship;
  wageBand:
    | "no-contribution"
    | "employer-only"
    | "phased-employee-share"
    | "full-rates";
  total: number;
  employee: number;
  employer: number;
  source: string;
}

/** Maximum OW contributions transcribed from CPF Board's official tables. */
export const CITIZEN_MAXIMUM_OW_GOLDEN: readonly ContributionGoldenFixture[] = [
  ...yearFixtures(
    "2023-01",
    6000,
    POLICY_SOURCES.contributionRates2023Jan.url,
    [
      [30, "55-and-below", 2220, 1200],
      [56, "above-55-to-60", 1770, 900],
      [61, "above-60-to-65", 1230, 570],
      [66, "above-65-to-70", 930, 420],
      [71, "above-70", 750, 300],
    ],
  ),
  ...yearFixtures(
    "2023-09",
    6300,
    POLICY_SOURCES.contributionRates2023Sep.url,
    [
      [30, "55-and-below", 2331, 1260],
      [56, "above-55-to-60", 1859, 945],
      [61, "above-60-to-65", 1292, 598],
      [66, "above-65-to-70", 977, 441],
      [71, "above-70", 788, 315],
    ],
  ),
  ...yearFixtures("2024-01", 6800, POLICY_SOURCES.contributionRates2024.url, [
    [30, "55-and-below", 2516, 1360],
    [56, "above-55-to-60", 2108, 1088],
    [61, "above-60-to-65", 1496, 714],
    [66, "above-65-to-70", 1122, 510],
    [71, "above-70", 850, 340],
  ]),
  ...yearFixtures("2025-01", 7400, POLICY_SOURCES.contributionRates2025.url, [
    [30, "55-and-below", 2738, 1480],
    [56, "above-55-to-60", 2405, 1258],
    [61, "above-60-to-65", 1739, 851],
    [66, "above-65-to-70", 1221, 555],
    [71, "above-70", 925, 370],
  ]),
  ...yearFixtures("2026-01", 8000, POLICY_SOURCES.contributionRates2026.url, [
    [30, "55-and-below", 2960, 1600],
    [56, "above-55-to-60", 2720, 1440],
    [61, "above-60-to-65", 2000, 1000],
    [66, "above-65-to-70", 1320, 600],
    [71, "above-70", 1000, 400],
  ]),
  ...yearFixtures("2027-01", 8000, POLICY_SOURCES.contributionRates2027.url, [
    [30, "55-and-below", 2960, 1600],
    [56, "above-55-to-60", 2840, 1520],
    [61, "above-60-to-65", 2080, 1040],
    [66, "above-65-to-70", 1320, 600],
    [71, "above-70", 1000, 400],
  ]),
];

/** Maximum-OW vectors spanning every dated schedule and citizenship status. */
export const CITIZENSHIP_SCHEDULE_GOLDEN: readonly ContributionGoldenFixture[] =
  [
    ...citizenshipScheduleFixtures(
      "2023-01",
      6000,
      POLICY_SOURCES.contributionRates2023Jan.url,
      [
        ["citizen", 2220, 1200],
        ["spr-year1", 540, 300],
        ["spr-year2", 1440, 900],
        ["spr-year3-plus", 2220, 1200],
      ],
    ),
    ...citizenshipScheduleFixtures(
      "2023-09",
      6300,
      POLICY_SOURCES.contributionRates2023Sep.url,
      [
        ["citizen", 2331, 1260],
        ["spr-year1", 567, 315],
        ["spr-year2", 1512, 945],
        ["spr-year3-plus", 2331, 1260],
      ],
    ),
    ...citizenshipScheduleFixtures(
      "2024-01",
      6800,
      POLICY_SOURCES.contributionRates2024.url,
      [
        ["citizen", 2516, 1360],
        ["spr-year1", 612, 340],
        ["spr-year2", 1632, 1020],
        ["spr-year3-plus", 2516, 1360],
      ],
    ),
    ...citizenshipScheduleFixtures(
      "2025-01",
      7400,
      POLICY_SOURCES.contributionRates2025.url,
      [
        ["citizen", 2738, 1480],
        ["spr-year1", 666, 370],
        ["spr-year2", 1776, 1110],
        ["spr-year3-plus", 2738, 1480],
      ],
    ),
    ...citizenshipScheduleFixtures(
      "2026-01",
      8000,
      POLICY_SOURCES.contributionRates2026.url,
      [
        ["citizen", 2960, 1600],
        ["spr-year1", 720, 400],
        ["spr-year2", 1920, 1200],
        ["spr-year3-plus", 2960, 1600],
      ],
    ),
    ...citizenshipScheduleFixtures(
      "2027-01",
      8000,
      POLICY_SOURCES.contributionRates2027.url,
      [
        ["citizen", 2960, 1600],
        ["spr-year1", 720, 400],
        ["spr-year2", 1920, 1200],
        ["spr-year3-plus", 2960, 1600],
      ],
    ),
  ];

/** G/G rows are unchanged since 2016; 2026 rows are the current PDF vector. */
export const PR_MAXIMUM_OW_GOLDEN: readonly ContributionGoldenFixture[] = [
  ...prFixtures("spr-year1", [
    [30, "55-and-below", 720, 400],
    [56, "above-55-to-60", 720, 400],
    [61, "above-60-to-65", 680, 400],
    [66, "above-65-to-70", 680, 400],
    [71, "above-70", 680, 400],
  ]),
  ...prFixtures("spr-year2", [
    [30, "55-and-below", 1920, 1200],
    [56, "above-55-to-60", 1480, 1000],
    [61, "above-60-to-65", 880, 600],
    [66, "above-65-to-70", 680, 400],
    [71, "above-70", 680, 400],
  ]),
  ...prFixtures("spr-year3-plus", [
    [30, "55-and-below", 2960, 1600],
    [56, "above-55-to-60", 2720, 1440],
    [61, "above-60-to-65", 2000, 1000],
    [66, "above-65-to-70", 1320, 600],
    [71, "above-70", 1000, 400],
  ]),
];

/** Exact official low-wage-band boundaries for each supported citizenship. */
export const WAGE_BAND_BOUNDARY_GOLDEN: readonly WageBandBoundaryGoldenFixture[] =
  [
    ...wageBandFixtures("citizen", [
      [50, "no-contribution", 0, 0],
      [50.01, "employer-only", 9, 0],
      [500, "employer-only", 85, 0],
      [500.01, "phased-employee-share", 85, 0],
      [600, "phased-employee-share", 162, 60],
      [750, "phased-employee-share", 278, 150],
      [750.01, "full-rates", 278, 150],
    ]),
    ...wageBandFixtures("spr-year1", [
      [50, "no-contribution", 0, 0],
      [50.01, "employer-only", 2, 0],
      [500, "employer-only", 20, 0],
      [500.01, "phased-employee-share", 20, 0],
      [600, "phased-employee-share", 39, 15],
      [750, "phased-employee-share", 68, 37],
      [750.01, "full-rates", 68, 37],
    ]),
    ...wageBandFixtures("spr-year2", [
      [50, "no-contribution", 0, 0],
      [50.01, "employer-only", 5, 0],
      [500, "employer-only", 45, 0],
      [500.01, "phased-employee-share", 45, 0],
      [600, "phased-employee-share", 99, 45],
      [750, "phased-employee-share", 180, 112],
      [750.01, "full-rates", 180, 112],
    ]),
    ...wageBandFixtures("spr-year3-plus", [
      [50, "no-contribution", 0, 0],
      [50.01, "employer-only", 9, 0],
      [500, "employer-only", 85, 0],
      [500.01, "phased-employee-share", 85, 0],
      [600, "phased-employee-share", 162, 60],
      [750, "phased-employee-share", 278, 150],
      [750.01, "full-rates", 278, 150],
    ]),
  ];

/**
 * Synthetic, non-personal vectors manually compared with CPF Board's live
 * calculator on the contribution dataset's verification date.
 */
export const CPF_BOARD_CALCULATOR_REGRESSION: readonly CpfBoardCalculatorRegressionFixture[] =
  [
    calculatorFixture("1996-08", "citizen", 5000, 1850, 1000),
    calculatorFixture("1968-08", "citizen", 5000, 1700, 900),
    calculatorFixture("1996-08", "citizen", 600, 162, 60),
    calculatorFixture("1996-08", "spr-year1", 5000, 450, 250),
  ];

type Row = readonly [number, ContributionAgeBandId, number, number];
type CitizenshipScheduleRow = readonly [
  ContributionCitizenship,
  number,
  number,
];

function yearFixtures(
  contributionMonth: string,
  ordinaryWages: number,
  source: string,
  rows: readonly Row[],
): ContributionGoldenFixture[] {
  return rows.map(([age, ageBand, total, employee]) => ({
    contributionMonth,
    ordinaryWages,
    age,
    citizenship: "citizen",
    ageBand,
    total,
    employee,
    employer: total - employee,
    source,
  }));
}

function citizenshipScheduleFixtures(
  contributionMonth: string,
  ordinaryWages: number,
  source: string,
  rows: readonly CitizenshipScheduleRow[],
): ContributionGoldenFixture[] {
  return rows.map(([citizenship, total, employee]) => ({
    contributionMonth,
    ordinaryWages,
    age: 30,
    citizenship,
    ageBand: "55-and-below",
    total,
    employee,
    employer: total - employee,
    source,
  }));
}

function prFixtures(
  citizenship: "spr-year1" | "spr-year2" | "spr-year3-plus",
  rows: readonly Row[],
): ContributionGoldenFixture[] {
  return rows.map(([age, ageBand, total, employee]) => ({
    contributionMonth: "2026-01",
    ordinaryWages: 8000,
    age,
    citizenship,
    ageBand,
    total,
    employee,
    employer: total - employee,
    source: POLICY_SOURCES.contributionRates2026.url,
  }));
}

type WageBandRow = readonly [
  number,
  WageBandBoundaryGoldenFixture["wageBand"],
  number,
  number,
];

function wageBandFixtures(
  citizenship: ContributionCitizenship,
  rows: readonly WageBandRow[],
): WageBandBoundaryGoldenFixture[] {
  return rows.map(([ordinaryWages, wageBand, total, employee]) => ({
    ordinaryWages,
    citizenship,
    wageBand,
    total,
    employee,
    employer: total - employee,
    source: POLICY_SOURCES.contributionRates2026.url,
  }));
}

function calculatorFixture(
  birthMonth: string,
  citizenship: ContributionCitizenship,
  ordinaryWages: number,
  total: number,
  employee: number,
): CpfBoardCalculatorRegressionFixture {
  return {
    birthMonth,
    contributionMonth: "2026-08",
    ordinaryWages,
    citizenship,
    total,
    employee,
    employer: total - employee,
    sourceUrl: POLICY_SOURCES.contributionCurrent.url,
    calculatorUrl: POLICY_SOURCES.contributionCalculator.url,
    calculatorLabel: "CPF Board CPF contribution calculator",
    verifiedAt: "2026-08-01",
    note: "Synthetic input retained solely as a sourced regression vector; it does not represent a real person.",
  };
}
