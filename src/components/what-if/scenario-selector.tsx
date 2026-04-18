"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ScenarioType = "salary" | "transfer" | "top-up" | "age-comparison";

const scenarioOptions: {
  label: string;
  value: ScenarioType;
}[] = [
  { label: "Salary Change", value: "salary" },
  { label: "OA to SA Transfer", value: "transfer" },
  { label: "Top-Up", value: "top-up" },
  { label: "Age Comparison", value: "age-comparison" },
];

export function isScenarioType(value: string | null): value is ScenarioType {
  return scenarioOptions.some((option) => option.value === value);
}

export default function ScenarioSelector() {
  return (
    <TabsList className="w-full justify-start overflow-x-auto rounded-2xl">
      {scenarioOptions.map((option) => (
        <TabsTrigger key={option.value} value={option.value}>
          {option.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
