import questionsJson from "@/data/retirement-readiness-questions.json";
import type { ReadinessAnswers } from "@/lib/calculate-retirement-readiness";

export interface ReadinessQuestionOption {
  value: string;
  label: string;
  description: string;
}

export interface ReadinessQuestion {
  key: keyof ReadinessAnswers;
  label: string;
  options: ReadinessQuestionOption[];
}

export const READINESS_QUESTIONS = questionsJson as ReadinessQuestion[];
