"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  calculateAgeComparisonScenario,
  calculateOaToSaScenario,
  calculateSalaryChangeScenario,
  calculateVoluntaryTopUpScenario,
} from "@/lib/calculate-what-if";
import { convertBirthDateToAge } from "@/lib/convert-birth-date-to-age";
import { formatDateInput, isValidDateFormat } from "@/utils/date-utils";
import AgeComparisonForm, {
  type AgeComparisonFormValues,
} from "./age-comparison-form";
import OaToSaForm, { type OaToSaFormValues } from "./oa-to-sa-form";
import SalaryChangeForm, {
  type SalaryChangeFormValues,
} from "./salary-change-form";
import ScenarioComparisonChart from "./scenario-comparison-chart";
import ScenarioResults from "./scenario-results";
import ScenarioSelector, {
  isScenarioType,
  type ScenarioType,
} from "./scenario-selector";
import VoluntaryTopUpForm, {
  type VoluntaryTopUpFormValues,
} from "./voluntary-top-up-form";

const defaultSalaryValues: SalaryChangeFormValues = {
  monthlyIncome: 5000,
  newIncome: 6000,
  birthDate: "01/1995",
  endAge: 65,
  citizenship: "citizen",
};

const defaultTransferValues: OaToSaFormValues = {
  monthlyIncome: 5000,
  birthDate: "01/1995",
  endAge: 65,
  citizenship: "citizen",
  transferAmount: 10000,
  transferTiming: "now",
};

const defaultTopUpValues: VoluntaryTopUpFormValues = {
  monthlyIncome: 5000,
  birthDate: "01/1995",
  endAge: 65,
  citizenship: "citizen",
  topUpAmount: 8000,
  topUpAccount: "SA",
};

const defaultAgeComparisonValues: AgeComparisonFormValues = {
  monthlyIncome: 5000,
  endAge: 65,
  citizenship: "citizen",
  baselineStartAge: 25,
  scenarioStartAge: 35,
};

function getScenarioSummary(
  scenario: ScenarioType,
  salaryValues: SalaryChangeFormValues,
  transferValues: OaToSaFormValues,
  topUpValues: VoluntaryTopUpFormValues,
  ageComparisonValues: AgeComparisonFormValues,
) {
  switch (scenario) {
    case "salary":
      return {
        title: "What if your salary changes?",
        description:
          "Compare your current monthly income against a higher or lower salary and see how the change flows through to your CPF balances.",
        baselineLabel: `Current income (${salaryValues.monthlyIncome.toLocaleString("en-SG")})`,
        scenarioLabel: `New income (${salaryValues.newIncome.toLocaleString("en-SG")})`,
      };
    case "transfer":
      return {
        title: "What if you move OA to SA?",
        description:
          "See how shifting money from OA into SA could change your compounding and retirement outcome.",
        baselineLabel: "No OA to SA transfer",
        scenarioLabel:
          transferValues.transferTiming === "yearly"
            ? "Repeat OA to SA transfer"
            : "One-off OA to SA transfer",
      };
    case "top-up":
      return {
        title: "What if you do annual top-ups?",
        description:
          "Estimate the combined effect of yearly top-ups, higher compounding, and CPF LIFE payout changes.",
        baselineLabel: "No annual top-up",
        scenarioLabel: `Annual ${topUpValues.topUpAccount} top-up`,
      };
    case "age-comparison":
      return {
        title: "What if you start later?",
        description:
          "Compare two starting ages to see the cost of delay on CPF contributions and compounding.",
        baselineLabel: `Start at age ${ageComparisonValues.baselineStartAge}`,
        scenarioLabel: `Start at age ${ageComparisonValues.scenarioStartAge}`,
      };
  }
}

export default function WhatIfContent() {
  const [scenario, setScenario] = useState<ScenarioType>("salary");
  const [salaryValues, setSalaryValues] = useState(defaultSalaryValues);
  const [transferValues, setTransferValues] = useState(defaultTransferValues);
  const [topUpValues, setTopUpValues] = useState(defaultTopUpValues);
  const [ageComparisonValues, setAgeComparisonValues] = useState(
    defaultAgeComparisonValues,
  );
  const [isPending, startTransition] = useTransition();

  const salaryHasValidBirthDate = isValidDateFormat(salaryValues.birthDate);
  const salaryCurrentAge = salaryHasValidBirthDate
    ? convertBirthDateToAge(salaryValues.birthDate)
    : null;
  const salaryHasValidRange =
    salaryCurrentAge === null || salaryValues.endAge >= salaryCurrentAge;

  const transferHasValidBirthDate = isValidDateFormat(transferValues.birthDate);
  const transferCurrentAge = transferHasValidBirthDate
    ? convertBirthDateToAge(transferValues.birthDate)
    : null;
  const transferHasValidRange =
    transferCurrentAge === null || transferValues.endAge >= transferCurrentAge;

  const topUpHasValidBirthDate = isValidDateFormat(topUpValues.birthDate);
  const topUpCurrentAge = topUpHasValidBirthDate
    ? convertBirthDateToAge(topUpValues.birthDate)
    : null;
  const topUpHasValidRange =
    topUpCurrentAge === null || topUpValues.endAge >= topUpCurrentAge;

  const ageComparisonHasValidRange =
    ageComparisonValues.endAge >
    Math.max(
      ageComparisonValues.baselineStartAge,
      ageComparisonValues.scenarioStartAge,
    );

  const scenarioSummary = getScenarioSummary(
    scenario,
    salaryValues,
    transferValues,
    topUpValues,
    ageComparisonValues,
  );

  const result = (() => {
    if (scenario === "salary") {
      if (
        salaryValues.monthlyIncome <= 0 ||
        salaryValues.newIncome <= 0 ||
        !salaryHasValidBirthDate ||
        !salaryHasValidRange
      ) {
        return null;
      }

      return calculateSalaryChangeScenario({
        projection: {
          monthlyIncome: salaryValues.monthlyIncome,
          birthDate: salaryValues.birthDate,
          endAge: salaryValues.endAge,
          citizenship: salaryValues.citizenship,
        },
        newMonthlyIncome: salaryValues.newIncome,
      });
    }

    if (scenario === "transfer") {
      if (
        transferValues.monthlyIncome <= 0 ||
        transferValues.transferAmount <= 0 ||
        !transferHasValidBirthDate ||
        !transferHasValidRange
      ) {
        return null;
      }

      return calculateOaToSaScenario({
        projection: {
          monthlyIncome: transferValues.monthlyIncome,
          birthDate: transferValues.birthDate,
          endAge: transferValues.endAge,
          citizenship: transferValues.citizenship,
        },
        transferAmount: transferValues.transferAmount,
        timing: transferValues.transferTiming,
      });
    }

    if (scenario === "top-up") {
      if (
        topUpValues.monthlyIncome <= 0 ||
        topUpValues.topUpAmount <= 0 ||
        !topUpHasValidBirthDate ||
        !topUpHasValidRange
      ) {
        return null;
      }

      return calculateVoluntaryTopUpScenario({
        projection: {
          monthlyIncome: topUpValues.monthlyIncome,
          birthDate: topUpValues.birthDate,
          endAge: topUpValues.endAge,
          citizenship: topUpValues.citizenship,
        },
        amount: topUpValues.topUpAmount,
        account: topUpValues.topUpAccount,
      });
    }

    if (
      ageComparisonValues.monthlyIncome <= 0 ||
      ageComparisonValues.baselineStartAge ===
        ageComparisonValues.scenarioStartAge ||
      !ageComparisonHasValidRange
    ) {
      return null;
    }

    return calculateAgeComparisonScenario({
      monthlyIncome: ageComparisonValues.monthlyIncome,
      endAge: ageComparisonValues.endAge,
      citizenship: ageComparisonValues.citizenship,
      baselineStartAge: ageComparisonValues.baselineStartAge,
      scenarioStartAge: ageComparisonValues.scenarioStartAge,
    });
  })();

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Tabs
        value={scenario}
        onValueChange={(value) => {
          if (isScenarioType(value)) {
            setScenario(value);
          }
        }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{scenarioSummary.title}</CardTitle>
            <CardDescription>{scenarioSummary.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ScenarioSelector />

            <TabsContent value="salary">
              <SalaryChangeForm
                values={salaryValues}
                currentAge={salaryCurrentAge}
                hasValidBirthDate={salaryHasValidBirthDate}
                hasValidRange={salaryHasValidRange}
                onBirthDateChange={(rawValue) => {
                  startTransition(() => {
                    setSalaryValues((currentValues) => ({
                      ...currentValues,
                      birthDate: formatDateInput(
                        rawValue,
                        currentValues.birthDate,
                      ),
                    }));
                  });
                }}
                onChange={(nextValues) => {
                  startTransition(() => {
                    setSalaryValues((currentValues) => ({
                      ...currentValues,
                      ...nextValues,
                    }));
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="transfer">
              <OaToSaForm
                values={transferValues}
                currentAge={transferCurrentAge}
                hasValidBirthDate={transferHasValidBirthDate}
                hasValidRange={transferHasValidRange}
                onBirthDateChange={(rawValue) => {
                  startTransition(() => {
                    setTransferValues((currentValues) => ({
                      ...currentValues,
                      birthDate: formatDateInput(
                        rawValue,
                        currentValues.birthDate,
                      ),
                    }));
                  });
                }}
                onChange={(nextValues) => {
                  startTransition(() => {
                    setTransferValues((currentValues) => ({
                      ...currentValues,
                      ...nextValues,
                    }));
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="top-up">
              <VoluntaryTopUpForm
                values={topUpValues}
                currentAge={topUpCurrentAge}
                hasValidBirthDate={topUpHasValidBirthDate}
                hasValidRange={topUpHasValidRange}
                onBirthDateChange={(rawValue) => {
                  startTransition(() => {
                    setTopUpValues((currentValues) => ({
                      ...currentValues,
                      birthDate: formatDateInput(
                        rawValue,
                        currentValues.birthDate,
                      ),
                    }));
                  });
                }}
                onChange={(nextValues) => {
                  startTransition(() => {
                    setTopUpValues((currentValues) => ({
                      ...currentValues,
                      ...nextValues,
                    }));
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="age-comparison">
              <AgeComparisonForm
                values={ageComparisonValues}
                hasValidRange={ageComparisonHasValidRange}
                onChange={(nextValues) => {
                  startTransition(() => {
                    setAgeComparisonValues((currentValues) => ({
                      ...currentValues,
                      ...nextValues,
                    }));
                  });
                }}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <div className="flex flex-col gap-6">
        {result ? (
          <>
            <ScenarioComparisonChart
              baseline={result.baseline}
              scenario={result.scenario}
              baselineLabel={scenarioSummary.baselineLabel}
              scenarioLabel={scenarioSummary.scenarioLabel}
            />
            <ScenarioResults
              result={result}
              baselineLabel={scenarioSummary.baselineLabel}
              scenarioLabel={scenarioSummary.scenarioLabel}
            />
          </>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Your what-if comparison will appear here</CardTitle>
              <CardDescription>
                Fill in the scenario inputs to compare the baseline and the
                alternative outcome.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-muted-foreground text-sm">
              <p>
                This simulator reuses the same CPF projection engine as the
                projection page, then layers a second scenario on top for a
                side-by-side comparison.
              </p>
              <ul className="flex list-disc flex-col gap-2 pl-6">
                <li>Salary change shows the impact of higher or lower pay.</li>
                <li>OA to SA transfer highlights extra compounding.</li>
                <li>Top-up compares voluntary contributions and tax relief.</li>
                <li>Age comparison shows the cost of delay.</li>
              </ul>
              {isPending ? (
                <p className="text-accent">Updating your scenario…</p>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
