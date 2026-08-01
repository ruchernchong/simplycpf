import { CPF_POLICY_CATALOGUE } from "@/policy";

export type ReadinessBucket = "low" | "mid" | "high";
export type ReadinessInterestArea = "projection" | "cpf-life" | "pr-rates";

export interface ReadinessAnswers {
  citizenshipStatus: "citizen" | "spr-new" | "spr-established" | "not-sure";
  housingUsage: "none" | "some" | "heavy" | "not-sure";
  planningHabit: "never" | "once" | "yearly" | "ongoing";
  topUpHabit: "never" | "considering" | "sometimes" | "consistent";
  cpfLifeConfidence: "low" | "medium" | "high";
}

export interface ReadinessResult {
  score: number;
  bucket: ReadinessBucket;
  bucketLabel: string;
  interestArea: ReadinessInterestArea;
  headline: string;
  summary: string;
  nextSteps: string[];
  primaryActionLabel: string;
  primaryActionHref: string;
}

const SCORE_MAP = {
  citizenshipStatus: {
    citizen: 15,
    "spr-new": 12,
    "spr-established": 15,
    "not-sure": 6,
  },
  housingUsage: {
    none: 20,
    some: 15,
    heavy: 8,
    "not-sure": 10,
  },
  planningHabit: {
    never: 0,
    once: 12,
    yearly: 20,
    ongoing: 25,
  },
  topUpHabit: {
    never: 0,
    considering: 8,
    sometimes: 15,
    consistent: 20,
  },
  cpfLifeConfidence: {
    low: 4,
    medium: 12,
    high: 20,
  },
} as const;

function getBucket(score: number): ReadinessBucket {
  if (score < 40) {
    return "low";
  }

  if (score < 70) {
    return "mid";
  }

  return "high";
}

function getInterestArea(
  answers: ReadinessAnswers,
  bucket: ReadinessBucket,
): ReadinessInterestArea {
  if (answers.citizenshipStatus !== "citizen") {
    return "pr-rates";
  }

  if (answers.cpfLifeConfidence === "low") {
    return "cpf-life";
  }

  if (bucket === "high") {
    return "projection";
  }

  return "projection";
}

function buildReadinessPresentation({
  bucket,
  interestArea,
}: {
  bucket: ReadinessBucket;
  interestArea: ReadinessInterestArea;
}) {
  const bucketLabel =
    bucket === "low"
      ? "Needs Attention"
      : bucket === "mid"
        ? "Building Foundations"
        : "On Track";

  const primaryActionLabel =
    interestArea === "cpf-life"
      ? "Open the CPF LIFE reference"
      : interestArea === "pr-rates"
        ? "Check PR rates on the calculator"
        : bucket === "high"
          ? "Test your next CPF scenario"
          : "Project my CPF balances";

  const primaryActionHref =
    interestArea === "cpf-life"
      ? "/cpf-life"
      : interestArea === "pr-rates"
        ? "/calculator"
        : bucket === "high"
          ? "/what-if"
          : "/projection";

  const headline =
    bucket === "low"
      ? "You do not need perfect CPF knowledge yet. You need a clearer next move."
      : bucket === "mid"
        ? "You have enough awareness to improve quickly once your plan becomes more concrete."
        : "You already have a decent CPF planning base. Now focus on optimisation instead of guesswork.";

  const summary =
    interestArea === "cpf-life"
      ? "Your answers suggest the biggest gap is understanding how CPF balances, plans and payout start age relate to retirement income."
      : interestArea === "pr-rates"
        ? "Your answers suggest the biggest gap is making sure your PR contribution assumptions are correct before you project forward."
        : bucket === "high"
          ? "Your answers suggest you are past the basics and should compare specific CPF decisions side by side."
          : "Your answers suggest the most useful next step is projecting your CPF balances before making another planning decision.";

  const nextSteps =
    interestArea === "cpf-life"
      ? [
          `Review CPF Board's published ${lifeReferenceYear} Standard Plan reference rows without treating them as a personalised quote.`,
          "Compare the characteristics of the Standard, Escalating, and Basic plans.",
          "Use CPF Board's Retirement Payout Planner for a personalised estimate.",
        ]
      : interestArea === "pr-rates"
        ? [
            "Check whether you are modelling the correct PR year status before doing any long-range planning.",
            "Compare PR Year 1, Year 2, and Year 3+ rates on the calculator so your assumptions match reality.",
            "Then project forward once your contribution base is correct.",
          ]
        : bucket === "high"
          ? [
              "Run a what-if scenario for salary changes, top-ups, or age-aware retirement transfers.",
              "Use the projection calculator as your baseline reference before comparing changes.",
              "Keep the CPF cheat sheet close so the latest rates and retirement sums stay easy to review.",
            ]
          : [
              `Project your CPF balances to age ${retirementAge} and ${payoutAge} using your current income and age.`,
              "Review how much OA is likely going to housing before you overestimate retirement balances.",
              "Use the cheat sheet to keep contribution rates, retirement sums, and top-up limits in one place.",
            ];

  return {
    bucketLabel,
    headline,
    summary,
    nextSteps,
    primaryActionLabel,
    primaryActionHref,
  };
}

export function calculateRetirementReadiness(
  answers: ReadinessAnswers,
): ReadinessResult {
  const score =
    SCORE_MAP.citizenshipStatus[answers.citizenshipStatus] +
    SCORE_MAP.housingUsage[answers.housingUsage] +
    SCORE_MAP.planningHabit[answers.planningHabit] +
    SCORE_MAP.topUpHabit[answers.topUpHabit] +
    SCORE_MAP.cpfLifeConfidence[answers.cpfLifeConfidence];

  const bucket = getBucket(score);
  const interestArea = getInterestArea(answers, bucket);

  return {
    score,
    bucket,
    interestArea,
    ...buildReadinessPresentation({ bucket, interestArea }),
  };
}

const retirementAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.retirementAccountCreated;
const payoutAge =
  CPF_POLICY_CATALOGUE.rules.lifecycleAges.cpfLifePayoutEligibility;
const lifeReferenceYear = CPF_POLICY_CATALOGUE.cpfLife.reference.year;
