"use client";

import { Alert, Button, Label } from "@heroui/react";
import { RadioButtonGroup } from "@heroui-pro/react";
import { useState } from "react";
import ReadinessScoreResult from "@/components/retirement-readiness/readiness-score-result";
import { READINESS_QUESTIONS } from "@/data/retirement-readiness-questions";
import {
  calculateRetirementReadiness,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/calculate-retirement-readiness";

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
          <RadioButtonGroup
            key={question.key}
            className="gap-4 md:grid-cols-2"
            layout="grid"
            name={question.key}
            value={answers[question.key]}
            onChange={(value) => {
              setAnswers((current) => ({
                ...current,
                [question.key]: value as ReadinessAnswers[typeof question.key],
              }));
              setFormError(null);
            }}
          >
            <Label className="col-span-full font-semibold text-foreground">
              {question.label}
            </Label>
            {question.options.map((choice) => (
              <RadioButtonGroup.Item key={choice.value} value={choice.value}>
                <RadioButtonGroup.Indicator />
                <RadioButtonGroup.ItemContent className="flex flex-col gap-2">
                  <span className="font-medium text-foreground">
                    {choice.label}
                  </span>
                  <span className="text-muted text-sm">
                    {choice.description}
                  </span>
                </RadioButtonGroup.ItemContent>
              </RadioButtonGroup.Item>
            ))}
          </RadioButtonGroup>
        ))}

        {formError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{formError}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        <Button type="submit" size="lg">
          Calculate my readiness score
        </Button>
      </form>

      {result ? <ReadinessScoreResult result={result} /> : null}
    </div>
  );
}
