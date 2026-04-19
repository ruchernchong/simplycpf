"use client";

import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, useTransition } from "react";
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
import ScenarioSummaryBanner from "./scenario-summary-banner";
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
  scenario: parseAsStringLiteral(scenarioTypes).withDefault("top-up"),
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
        baselineLabel: `Current income $${salaryValues.monthlyIncome.toLocaleString("en-SG")}`,
        scenarioLabel: `New income $${salaryValues.newIncome.toLocaleString("en-SG")}`,
      };
    case "transfer":
      return {
        baselineLabel: "No OA to SA transfer",
        scenarioLabel:
          transferValues.transferTiming === "yearly"
            ? `Repeat $${transferValues.transferAmount.toLocaleString("en-SG")} yearly`
            : `One-off $${transferValues.transferAmount.toLocaleString("en-SG")}`,
      };
    case "top-up":
      return {
        baselineLabel: "No annual top-up",
        scenarioLabel: `$${topUpValues.topUpAmount.toLocaleString("en-SG")} ${topUpValues.topUpAccount} top-up`,
      };
    case "age-comparison":
      return {
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
  const [, startTransition] = useTransition();
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
    <div className="flex flex-col gap-5">
      <Tabs
        value={scenario}
        onValueChange={(value) => {
          if (isScenarioType(value)) {
            handleSharedChange({ scenario: value });
          }
        }}
      >
        <ScenarioSelector active={scenario} />

        <div className="mt-5 rounded-lg border border-border bg-card p-6 shadow-sm">
          <TabsContent value="salary" className="m-0">
            <SalaryChangeForm
              values={salaryValues}
              currentAge={salaryCurrentAge}
              hasValidBirthDate={salaryHasValidBirthDate}
              hasValidRange={salaryHasValidRange}
              onBirthDateChange={handleBirthDateChange}
              onChange={handleSharedChange}
            />
          </TabsContent>

          <TabsContent value="transfer" className="m-0">
            <OaToSaForm
              values={transferValues}
              currentAge={transferCurrentAge}
              hasValidBirthDate={transferHasValidBirthDate}
              hasValidRange={transferHasValidRange}
              onBirthDateChange={handleBirthDateChange}
              onChange={handleSharedChange}
            />
          </TabsContent>

          <TabsContent value="top-up" className="m-0">
            <VoluntaryTopUpForm
              values={topUpValues}
              currentAge={topUpCurrentAge}
              hasValidBirthDate={topUpHasValidBirthDate}
              hasValidRange={topUpHasValidRange}
              onBirthDateChange={handleBirthDateChange}
              onChange={handleSharedChange}
            />
          </TabsContent>

          <TabsContent value="age-comparison" className="m-0">
            <AgeComparisonForm
              values={ageComparisonValues}
              hasValidRange={ageComparisonHasValidRange}
              onChange={handleSharedChange}
            />
          </TabsContent>
        </div>
      </Tabs>

      {result ? (
        <>
          <ScenarioComparisonChart
            baseline={result.baseline}
            scenario={result.scenario}
            baselineLabel={scenarioSummary.baselineLabel}
            scenarioLabel={scenarioSummary.scenarioLabel}
          />
          <ScenarioSummaryBanner
            age65Delta={result.difference.age65Balance}
            cpfLifeDelta={result.difference.cpfLifeMonthlyPayout}
          />
          <ScenarioResults
            result={result}
            baselineLabel={scenarioSummary.baselineLabel}
            scenarioLabel={scenarioSummary.scenarioLabel}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyWhatIfLink}
              className="rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              {linkCopied ? "Link copied" : "Copy share link"}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-border border-dashed bg-card p-8 text-muted-foreground">
          <h3 className="font-semibold text-[16px] text-foreground">
            Your what-if comparison will appear here
          </h3>
          <p className="text-[13px]">
            Fill in the scenario inputs above to see a side-by-side comparison.
          </p>
        </div>
      )}
    </div>
  );
}
