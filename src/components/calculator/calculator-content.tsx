"use client";

import { Skeleton } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useCpfStore } from "@/hooks/use-cpf-store";
import {
  selectAge,
  selectAgeGroup,
  selectFormStep,
  selectLatestIncomeCeilingDate,
  selectMonthlyGrossIncome,
} from "@/stores/selectors";
import { CalculatorInputs } from "./calculator-inputs";
import { CalculatorResults } from "./calculator-results";
import { buildFigures, buildIllustrativeFigures } from "./figures";

function CalculatorContent() {
  const [isMounted, setIsMounted] = useState(false);

  const ceilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const formStep = useCpfStore(selectFormStep);
  const income = useCpfStore(selectMonthlyGrossIncome);
  const age = useCpfStore(selectAge);
  const ageGroup = useCpfStore(selectAgeGroup);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const figures = useMemo(() => {
    if (!isMounted || formStep < 2) {
      return buildIllustrativeFigures(ceilingDate);
    }

    return buildFigures({
      income,
      age,
      ageGroup,
      ceilingDate,
      isIllustrative: false,
    });
  }, [isMounted, formStep, income, age, ageGroup, ceilingDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
      {isMounted ? (
        <CalculatorInputs ceilingDate={ceilingDate} />
      ) : (
        <Skeleton className="h-[420px] w-full rounded-lg" />
      )}
      <CalculatorResults figures={figures} />
    </div>
  );
}

export default CalculatorContent;
