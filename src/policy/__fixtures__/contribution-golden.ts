import type {
  ContributionAgeBandId,
  ContributionCitizenship,
} from "../contributions";

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

const PAST_SOURCE =
  "https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay/past-cpf-contribution-and-allocation-rates";
const CURRENT_SOURCE =
  "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf";
const SOURCE_2027 =
  "https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2027cpfcontributionrates.pdf";
const CPF_BOARD_CALCULATOR_SOURCE =
  "https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay";
const CPF_BOARD_CALCULATOR_URL =
  "https://www.cpf.gov.sg/employer/tools-and-services/calculators/cpf-contribution-calculator";

/** Maximum OW contributions transcribed from CPF Board's official tables. */
export const CITIZEN_MAXIMUM_OW_GOLDEN: readonly ContributionGoldenFixture[] = [
  ...yearFixtures("2023-01", 6000, PAST_SOURCE, [
    [30, "55-and-below", 2220, 1200],
    [56, "above-55-to-60", 1770, 900],
    [61, "above-60-to-65", 1230, 570],
    [66, "above-65-to-70", 930, 420],
    [71, "above-70", 750, 300],
  ]),
  ...yearFixtures("2023-09", 6300, PAST_SOURCE, [
    [30, "55-and-below", 2331, 1260],
    [56, "above-55-to-60", 1859, 945],
    [61, "above-60-to-65", 1292, 598],
    [66, "above-65-to-70", 977, 441],
    [71, "above-70", 788, 315],
  ]),
  ...yearFixtures("2024-01", 6800, PAST_SOURCE, [
    [30, "55-and-below", 2516, 1360],
    [56, "above-55-to-60", 2108, 1088],
    [61, "above-60-to-65", 1496, 714],
    [66, "above-65-to-70", 1122, 510],
    [71, "above-70", 850, 340],
  ]),
  ...yearFixtures("2025-01", 7400, PAST_SOURCE, [
    [30, "55-and-below", 2738, 1480],
    [56, "above-55-to-60", 2405, 1258],
    [61, "above-60-to-65", 1739, 851],
    [66, "above-65-to-70", 1221, 555],
    [71, "above-70", 925, 370],
  ]),
  ...yearFixtures("2026-01", 8000, CURRENT_SOURCE, [
    [30, "55-and-below", 2960, 1600],
    [56, "above-55-to-60", 2720, 1440],
    [61, "above-60-to-65", 2000, 1000],
    [66, "above-65-to-70", 1320, 600],
    [71, "above-70", 1000, 400],
  ]),
  ...yearFixtures("2027-01", 8000, SOURCE_2027, [
    [30, "55-and-below", 2960, 1600],
    [56, "above-55-to-60", 2840, 1520],
    [61, "above-60-to-65", 2080, 1040],
    [66, "above-65-to-70", 1320, 600],
    [71, "above-70", 1000, 400],
  ]),
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
];

/**
 * Synthetic, non-personal vectors manually compared with CPF Board's live
 * calculator on the catalogue verification date.
 */
export const CPF_BOARD_CALCULATOR_REGRESSION: readonly CpfBoardCalculatorRegressionFixture[] =
  [
    calculatorFixture("1996-08", "citizen", 5000, 1850, 1000),
    calculatorFixture("1968-08", "citizen", 5000, 1700, 900),
    calculatorFixture("1996-08", "citizen", 600, 162, 60),
    calculatorFixture("1996-08", "spr-year1", 5000, 450, 250),
  ];

type Row = readonly [number, ContributionAgeBandId, number, number];

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

function prFixtures(
  citizenship: "spr-year1" | "spr-year2",
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
    source: CURRENT_SOURCE,
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
    sourceUrl: CPF_BOARD_CALCULATOR_SOURCE,
    calculatorUrl: CPF_BOARD_CALCULATOR_URL,
    calculatorLabel: "CPF Board CPF contribution calculator",
    verifiedAt: "2026-08-01",
    note: "Synthetic input retained solely as a sourced regression vector; it does not represent a real person.",
  };
}
