import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";

export interface InvestmentScenario {
  id: "cpf-oa" | "cpf-smra" | "user-assumption";
  name: string;
  rate: number;
  basis: "official" | "assumed";
}

export function createInvestmentScenarios(
  assumedAnnualReturn: number,
): InvestmentScenario[] {
  return [
    {
      id: "cpf-oa",
      name: "CPF OA floor",
      rate: CPF_INTEREST_FLOOR_RATES.OA,
      basis: "official",
    },
    {
      id: "cpf-smra",
      name: "CPF SMRA floor",
      rate: CPF_INTEREST_FLOOR_RATES.SMRA,
      basis: "official",
    },
    {
      id: "user-assumption",
      name: "Your investment assumption",
      rate: Math.max(-100, assumedAnnualReturn),
      basis: "assumed",
    },
  ];
}

export function calculateCompoundGrowth(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return principal * (1 + annualRate / 100) ** years;
}
