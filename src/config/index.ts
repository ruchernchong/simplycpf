export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;

export const title = "SimplyCPF";
export const description =
  "Calculate, project, and plan your CPF with free tools for contributions, retirement balances, CPF LIFE, and scenario modelling.";

export const CPF_TYPE = {
  OA: "OA",
  SA: "SA",
  MA: "MA",
};

export const DEFAULT_EMPLOYEE_CONTRIBUTION_RATE: number = 0.2;
export const DEFAULT_EMPLOYER_CONTRIBUTION_RATE: number = 0.17;
