import type { ReadinessAnswers } from "@/lib/calculate-retirement-readiness";

type AnswerKey = keyof ReadinessAnswers;

export interface ReadinessQuestionOption {
  value: string;
  label: string;
  description: string;
}

export interface ReadinessQuestion {
  key: AnswerKey;
  label: string;
  options: ReadinessQuestionOption[];
}

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  {
    key: "citizenshipStatus",
    label: "Which option best matches your CPF status today?",
    options: [
      {
        value: "citizen",
        label: "Singapore Citizen",
        description: "I use the standard citizen CPF rates today.",
      },
      {
        value: "spr-new",
        label: "PR in Year 1 or 2",
        description:
          "My CPF uses graduated PR rates or I am still in transition.",
      },
      {
        value: "spr-established",
        label: "PR on full rates",
        description: "I am a PR already paying the full CPF rates.",
      },
      {
        value: "not-sure",
        label: "Not sure",
        description: "I am not fully sure which CPF rate table applies to me.",
      },
    ],
  },
  {
    key: "housingUsage",
    label: "How much of your OA do you expect housing to use up?",
    options: [
      {
        value: "none",
        label: "Little or none",
        description:
          "Most of my OA is likely to remain available for planning.",
      },
      {
        value: "some",
        label: "Some OA usage",
        description:
          "Housing affects my OA, but not to the point where I ignore the rest.",
      },
      {
        value: "heavy",
        label: "A large share",
        description: "Housing is likely to consume a large part of my OA.",
      },
      {
        value: "not-sure",
        label: "Not sure",
        description:
          "I do not really know how housing changes my CPF trajectory.",
      },
    ],
  },
  {
    key: "planningHabit",
    label: "How often do you project or review your CPF balances?",
    options: [
      {
        value: "never",
        label: "Never",
        description: "I have not modelled my CPF balances before.",
      },
      {
        value: "once",
        label: "Once or twice",
        description: "I have checked it before, but not as a habit.",
      },
      {
        value: "yearly",
        label: "At least yearly",
        description: "I review CPF as part of a regular financial check-in.",
      },
      {
        value: "ongoing",
        label: "Ongoing",
        description:
          "I actively compare CPF decisions and update my assumptions.",
      },
    ],
  },
  {
    key: "topUpHabit",
    label: "How do you currently treat top-ups or OA to SA transfers?",
    options: [
      {
        value: "never",
        label: "I do not do them",
        description: "I have not explored top-ups or transfers seriously.",
      },
      {
        value: "considering",
        label: "I am considering them",
        description: "I know they matter, but I have not acted yet.",
      },
      {
        value: "sometimes",
        label: "Occasionally",
        description: "I do them selectively when the numbers look attractive.",
      },
      {
        value: "consistent",
        label: "Consistently",
        description:
          "I already use top-ups or transfers as part of my CPF strategy.",
      },
    ],
  },
  {
    key: "cpfLifeConfidence",
    label: "How clear are you about your future CPF LIFE payout range?",
    options: [
      {
        value: "low",
        label: "Not clear",
        description: "I do not know roughly what payout range I should expect.",
      },
      {
        value: "medium",
        label: "Somewhat clear",
        description:
          "I have a rough idea, but I have not compared plans carefully.",
      },
      {
        value: "high",
        label: "Clear enough",
        description:
          "I understand the rough payout ranges and main plan differences.",
      },
    ],
  },
];
