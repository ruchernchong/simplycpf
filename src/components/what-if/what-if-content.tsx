"use client";

import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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

const scenarioTypes = [
  "salary",
  "transfer",
  "top-up",
  "age-comparison",
] as const;

const citizenshipStatuses = [
  "citizen",
  "spr-year1",
  "spr-year2",
  "spr-year3-plus",
] as const;

const transferTimings = ["now", "yearly"] as const;
const topUpAccounts = ["SA", "MA", "RA"] as const;

const whatIfSearchParams = {
  scenario: parseAsStringLiteral(scenarioTypes).withDefault("salary"),
  monthlyIncome: parseAsInteger.withDefault(defaultSalaryValues.monthlyIncome),
  birthDate: parseAsString.withDefault(defaultSalaryValues.birthDate),
  endAge: parseAsInteger.withDefault(defaultSalaryValues.endAge),
  citizenship: parseAsStringLiteral(citizenshipStatuses).withDefault(
    defaultSalaryValues.citizenship,
  ),
  newIncome: parseAsInteger.withDefault(defaultSalaryValues.newIncome),
  transferAmount: parseAsInteger.withDefault(
    defaultTransferValues.transferAmount,
  ),
  transferTiming: parseAsStringLiteral(transferTimings).withDefault(
    defaultTransferValues.transferTiming,
  ),
  topUpAmount: parseAsInteger.withDefault(defaultTopUpValues.topUpAmount),
  topUpAccount: parseAsStringLiteral(topUpAccounts).withDefault(
    defaultTopUpValues.topUpAccount,
  ),
  baselineStartAge: parseAsInteger.withDefault(
    defaultAgeComparisonValues.baselineStartAge,
  ),
  scenarioStartAge: parseAsInteger.withDefault(
    defaultAgeComparisonValues.scenarioStartAge,
  ),
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
  const [queryValues, setQueryValues] = useQueryStates(whatIfSearchParams, {
    urlKeys: {
      monthlyIncome: "income",
      transferAmount: "transfer",
      topUpAmount: "topUp",
      baselineStartAge: "baselineAge",
      scenarioStartAge: "scenarioAge",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);

  const scenario = queryValues.scenario;
  const salaryValues: SalaryChangeFormValues = {
    monthlyIncome: queryValues.monthlyIncome,
    newIncome: queryValues.newIncome,
    birthDate: queryValues.birthDate,
    endAge: queryValues.endAge,
    citizenship: queryValues.citizenship,
  };
  const transferValues: OaToSaFormValues = {
    monthlyIncome: queryValues.monthlyIncome,
    birthDate: queryValues.birthDate,
    endAge: queryValues.endAge,
    citizenship: queryValues.citizenship,
    transferAmount: queryValues.transferAmount,
    transferTiming: queryValues.transferTiming,
  };
  const topUpValues: VoluntaryTopUpFormValues = {
    monthlyIncome: queryValues.monthlyIncome,
    birthDate: queryValues.birthDate,
    endAge: queryValues.endAge,
    citizenship: queryValues.citizenship,
    topUpAmount: queryValues.topUpAmount,
    topUpAccount: queryValues.topUpAccount,
  };
  const ageComparisonValues: AgeComparisonFormValues = {
    monthlyIncome: queryValues.monthlyIncome,
    endAge: queryValues.endAge,
    citizenship: queryValues.citizenship,
    baselineStartAge: queryValues.baselineStartAge,
    scenarioStartAge: queryValues.scenarioStartAge,
  };

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

  const handleSharedChange = (nextValues: Partial<typeof queryValues>) => {
    startTransition(() => {
      void setQueryValues(nextValues);
    });
  };

  const handleBirthDateChange = (rawValue: string) => {
    const birthDate = formatDateInput(rawValue, queryValues.birthDate);

    startTransition(() => {
      void setQueryValues({
        birthDate: birthDate.length > 0 ? birthDate : null,
      });
    });
  };

  const handleCopyWhatIfLink = async () => {
    try {
      await navigator.clipboard.writeText(
        globalThis.window?.location.href ?? "",
      );
      setLinkCopied(true);
      globalThis.window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Tabs
        value={scenario}
        onValueChange={(value) => {
          if (isScenarioType(value)) {
            handleSharedChange({ scenario: value });
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
                onBirthDateChange={handleBirthDateChange}
                onChange={handleSharedChange}
              />
            </TabsContent>

            <TabsContent value="transfer">
              <OaToSaForm
                values={transferValues}
                currentAge={transferCurrentAge}
                hasValidBirthDate={transferHasValidBirthDate}
                hasValidRange={transferHasValidRange}
                onBirthDateChange={handleBirthDateChange}
                onChange={handleSharedChange}
              />
            </TabsContent>

            <TabsContent value="top-up">
              <VoluntaryTopUpForm
                values={topUpValues}
                currentAge={topUpCurrentAge}
                hasValidBirthDate={topUpHasValidBirthDate}
                hasValidRange={topUpHasValidRange}
                onBirthDateChange={handleBirthDateChange}
                onChange={handleSharedChange}
              />
            </TabsContent>

            <TabsContent value="age-comparison">
              <AgeComparisonForm
                values={ageComparisonValues}
                hasValidRange={ageComparisonHasValidRange}
                onChange={handleSharedChange}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <div className="flex flex-col gap-6">
        {result ? (
          <>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCopyWhatIfLink}>
                {linkCopied ? "Link copied" : "Copy share link"}
              </Button>
            </div>
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
