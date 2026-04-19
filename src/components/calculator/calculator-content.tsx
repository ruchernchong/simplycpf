"use client";

import { Suspense } from "react";
import { shallow } from "zustand/shallow";
import { CalculatedResult } from "@/components/calculator/calculated-result";
import { CeilingChangeReminder } from "@/components/calculator/ceiling-change-reminder";
import CeilingComparisonCard from "@/components/calculator/ceiling-comparison-card";
import DistributionView from "@/components/calculator/distribution-view";
import StepSection from "@/components/calculator/step-section";
import UserInput from "@/components/calculator/user-input";
import { useCpfStore } from "@/hooks/use-cpf-store";
import {
  selectDistributionResults,
  selectFormStep,
  selectHasCpfContribution,
} from "@/stores/selectors";

const ComparisonFallback = () => (
  <div className="h-64 w-full animate-pulse rounded-lg bg-zinc-200" />
);

const DistributionFallback = () => (
  <div>
    <div className="mb-6 h-8 w-48 animate-pulse rounded bg-zinc-200" />
    <div className="h-80 w-full animate-pulse rounded-lg bg-zinc-200" />
  </div>
);

const CalculatorContent = () => {
  const step = useCpfStore(selectFormStep);
  const hasCpfContribution = useCpfStore(selectHasCpfContribution);
  const distributionResults = useCpfStore(selectDistributionResults, shallow);
  const showResults = step >= 2;

  return (
    <div>
      <div className="mb-8 grid gap-8 md:grid-cols-2">
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
        <div className="mb-8">
          <Suspense fallback={<ComparisonFallback />}>
            <CeilingComparisonCard />
          </Suspense>
        </div>
      </StepSection>
      <StepSection show={showResults && hasCpfContribution} delay={0.2}>
        <Suspense fallback={<DistributionFallback />}>
          <div>
            <h2 className="mb-6 text-center font-semibold text-2xl">
              How Your CPF Is Distributed Across Accounts
            </h2>
            <DistributionView distributionResults={distributionResults} />
          </div>
        </Suspense>
      </StepSection>
    </div>
  );
};

export default CalculatorContent;
