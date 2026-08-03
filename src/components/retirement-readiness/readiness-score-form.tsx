"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import ReadinessScoreResult from "@/components/retirement-readiness/readiness-score-result";
import {
  calculateRetirementReadiness,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

type AnswerKey = keyof ReadinessAnswers;

function option<TValue extends string>(
  value: TValue,
  label: string,
  description: string,
) {
  return { value, label, description } as const;
}

const questions = [
  {
    key: "citizenshipStatus" satisfies AnswerKey,
    label: "Which option best matches your CPF status today?",
    options: [
      option(
        "citizen",
        "Singapore Citizen",
        "I use the standard citizen CPF rates today.",
      ),
      option(
        "spr-new",
        "PR in Year 1 or 2",
        "My CPF uses graduated PR rates or I am still in transition.",
      ),
      option(
        "spr-established",
        "PR on full rates",
        "I am a PR already paying the full CPF rates.",
      ),
      option(
        "not-sure",
        "Not sure",
        "I am not fully sure which CPF rate table applies to me.",
      ),
    ],
  },
  {
    key: "housingUsage" satisfies AnswerKey,
    label: "How much of your OA do you expect housing to use up?",
    options: [
      option(
        "none",
        "Little or none",
        "Most of my OA is likely to remain available for planning.",
      ),
      option(
        "some",
        "Some OA usage",
        "Housing affects my OA, but not to the point where I ignore the rest.",
      ),
      option(
        "heavy",
        "A large share",
        "Housing is likely to consume a large part of my OA.",
      ),
      option(
        "not-sure",
        "Not sure",
        "I do not really know how housing changes my CPF trajectory.",
      ),
    ],
  },
  {
    key: "planningHabit" satisfies AnswerKey,
    label: "How often do you project or review your CPF balances?",
    options: [
      option("never", "Never", "I have not modelled my CPF balances before."),
      option(
        "once",
        "Once or twice",
        "I have checked it before, but not as a habit.",
      ),
      option(
        "yearly",
        "At least yearly",
        "I review CPF as part of a regular financial check-in.",
      ),
      option(
        "ongoing",
        "Ongoing",
        "I actively compare CPF decisions and update my assumptions.",
      ),
    ],
  },
  {
    key: "topUpHabit" satisfies AnswerKey,
    label: "How do you currently treat top-ups or OA to SA transfers?",
    options: [
      option(
        "never",
        "I do not do them",
        "I have not explored top-ups or transfers seriously.",
      ),
      option(
        "considering",
        "I am considering them",
        "I know they matter, but I have not acted yet.",
      ),
      option(
        "sometimes",
        "Occasionally",
        "I do them selectively when the numbers look attractive.",
      ),
      option(
        "consistent",
        "Consistently",
        "I already use top-ups or transfers as part of my CPF strategy.",
      ),
    ],
  },
  {
    key: "cpfLifeConfidence" satisfies AnswerKey,
    label: "How clear are you about your future CPF LIFE payout range?",
    options: [
      option(
        "low",
        "Not clear",
        "I do not know roughly what payout range I should expect.",
      ),
      option(
        "medium",
        "Somewhat clear",
        "I have a rough idea, but I have not compared plans carefully.",
      ),
      option(
        "high",
        "Clear enough",
        "I understand the rough payout ranges and main plan differences.",
      ),
    ],
  },
] as const;

export default function ReadinessScoreForm() {
  const [answers, setAnswers] = useState<Partial<ReadinessAnswers>>({});
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingQuestion = questions.find(
      (question) => !answers[question.key],
    );

    if (missingQuestion) {
      setFormError(
        "Please answer all 5 questions before calculating your score.",
      );
      return;
    }

    setFormError(null);
    setResult(calculateRetirementReadiness(answers as ReadinessAnswers));
  };

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-6" onSubmit={handleCalculate}>
        {questions.map((question) => (
          <fieldset key={question.key} className="flex flex-col gap-4">
            <legend className="font-semibold text-foreground">
              {question.label}
            </legend>
            <div className="grid gap-4 md:grid-cols-2">
              {question.options.map((choice) => {
                const isSelected = answers[question.key] === choice.value;

                return (
                  <label
                    key={choice.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/40",
                    )}
                  >
                    <input
                      type="radio"
                      name={question.key}
                      value={choice.value}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.key]: choice.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="font-medium text-foreground">
                      {choice.label}
                    </span>
                    <span className="text-muted text-sm">
                      {choice.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {formError ? <p className="text-danger text-sm">{formError}</p> : null}
        <Button type="submit" size="lg">
          Calculate my readiness score
        </Button>
      </form>

      {result ? <ReadinessScoreResult result={result} /> : null}
    </div>
  );
}
