"use client";

import { Suspense } from "react";
import { CalculatedResult } from "@/components/calculator/calculated-result";
import { CeilingChangeReminder } from "@/components/calculator/ceiling-change-reminder";
import CeilingComparisonCard from "@/components/calculator/ceiling-comparison-card";
import StepSection from "@/components/calculator/step-section";
import UserInput from "@/components/calculator/user-input";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { selectFormStep } from "@/stores/selectors";

const ComparisonFallback = () => (
  <div className="h-64 w-full animate-pulse rounded-lg bg-zinc-200" />
);

const CalculatorContent = () => {
  const step = useCpfStore(selectFormStep);
  const showResults = step >= 2;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
          }
        >
          <UserInput />
        </Suspense>
        <StepSection show={showResults}>
          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
            }
          >
            <CalculatedResult />
          </Suspense>
        </StepSection>
      </div>
      <Suspense fallback={null}>
        <CeilingChangeReminder />
      </Suspense>
      <StepSection show={showResults} delay={0.1}>
        <Suspense fallback={<ComparisonFallback />}>
          <CeilingComparisonCard />
        </Suspense>
      </StepSection>
    </div>
  );
};

export default CalculatorContent;
