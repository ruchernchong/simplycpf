"use client";

import { Button, Typography } from "@heroui/react";
import { useState } from "react";
import ReadinessScoreResult from "@/components/lead-magnets/readiness-score-result";
import {
  calculateRetirementReadiness,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

const questions = [
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
          <fieldset key={question.key} className="flex flex-col gap-3">
            <legend>
              <Typography
                render={({ children, ...domProps }) => (
                  <span {...domProps}>{children}</span>
                )}
                weight="semibold"
              >
                {question.label}
              </Typography>
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              {question.options.map((option) => {
                const isSelected = answers[question.key] === option.value;

                return (
                  <label
                    key={option.value}
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
                      value={option.value}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.key]: option.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <Typography
                      render={({ children, ...domProps }) => (
                        <span {...domProps}>{children}</span>
                      )}
                      weight="medium"
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      color="muted"
                      render={({ children, ...domProps }) => (
                        <span {...domProps}>{children}</span>
                      )}
                      type="body-sm"
                    >
                      {option.description}
                    </Typography>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {formError ? (
          <Typography className="text-destructive" type="body-sm">
            {formError}
          </Typography>
        ) : null}
        <Button type="submit" size="lg">
          Calculate my readiness score
        </Button>
      </form>

      {result ? <ReadinessScoreResult result={result} /> : null}
    </div>
  );
}
