"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import ReadinessScoreResult from "@/components/retirement-readiness/readiness-score-result";
import { READINESS_QUESTIONS } from "@/data/retirement-readiness-questions";
import {
  calculateRetirementReadiness,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/calculate-retirement-readiness";
import { cn } from "@/lib/utils";

export default function ReadinessScoreForm() {
  const [answers, setAnswers] = useState<Partial<ReadinessAnswers>>({});
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCalculate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasMissingAnswer = READINESS_QUESTIONS.some(
      (question) => !answers[question.key],
    );

    if (hasMissingAnswer) {
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
        {READINESS_QUESTIONS.map((question) => (
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
