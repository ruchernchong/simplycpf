"use client";

import {
  Card,
  Label,
  NumberField,
  Slider,
  Table,
  Typography,
} from "@heroui/react";
import posthog from "posthog-js";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { formatCurrency, formatPercentage } from "@/lib/format";

interface InvestmentScenario {
  name: string;
  rate: number;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  color: string;
}

const INVESTMENT_SCENARIOS: InvestmentScenario[] = [
  {
    name: "CPF OA",
    rate: CPF_INTEREST_FLOOR_RATES.OA,
    description: "Ordinary Account, fixed floor rate",
    riskLevel: "Low",
    color: "#3b82f6",
  },
  {
    name: "CPF SA/MA/RA",
    rate: CPF_INTEREST_FLOOR_RATES.SMRA,
    description: "Special, MediSave & Retirement Accounts",
    riskLevel: "Low",
    color: "#10b981",
  },
  {
    name: "Singapore Bonds",
    rate: 3.5,
    description: "Government bonds and corporate bonds",
    riskLevel: "Low",
    color: "#f59e0b",
  },
  {
    name: "STI ETF",
    rate: 6.0,
    description: "Straits Times Index ETF (historical avg)",
    riskLevel: "Medium",
    color: "#8b5cf6",
  },
  {
    name: "Global Equity ETF",
    rate: 7.5,
    description: "MSCI World Index (historical avg)",
    riskLevel: "Medium",
    color: "#ec4899",
  },
  {
    name: "Tech Stocks",
    rate: 10.0,
    description: "Technology sector equities (high volatility)",
    riskLevel: "High",
    color: "#ef4444",
  },
];

interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

const calculateGrowth = (
  principal: number,
  rate: number,
  years: number,
): number => {
  return principal * (1 + rate / 100) ** years;
};

export function CPFInvestmentComparison() {
  const [principal, setPrincipal] = useState<number>(50000);
  const [years, setYears] = useState<number>(20);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    "CPF OA",
    "CPF SA/MA/RA",
    "STI ETF",
  ]);

  const toggleScenario = (name: string) => {
    setSelectedScenarios((prev) => {
      const isRemoving = prev.includes(name);
      const next = isRemoving
        ? prev.filter((s) => s !== name)
        : [...prev, name].slice(0, 4);
      posthog.capture("investment_scenario_toggled", {
        scenario: name,
        action: isRemoving ? "removed" : "added",
        active_scenarios: next,
      });
      return next;
    });
  };

  // Generate chart data
  const chartData: ChartDataPoint[] = Array.from(
    { length: years + 1 },
    (_, year) => {
      const dataPoint: ChartDataPoint = { year };
      INVESTMENT_SCENARIOS.filter((s) =>
        selectedScenarios.includes(s.name),
      ).forEach((scenario) => {
        dataPoint[scenario.name] = calculateGrowth(
          principal,
          scenario.rate,
          year,
        );
      });
      return dataPoint;
    },
  );

  // Calculate final values for comparison table
  const finalValues = INVESTMENT_SCENARIOS.map((scenario) => ({
    ...scenario,
    finalValue: calculateGrowth(principal, scenario.rate, years),
    totalGain: calculateGrowth(principal, scenario.rate, years) - principal,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Disclaimer Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <Card.Content>
          <Typography className="text-amber-900" type="body-sm">
            <strong>Disclaimer:</strong> The investment returns shown are
            historical averages and do not guarantee future performance.
            Investments carry risks including potential loss of principal. CPF
            savings are guaranteed by the Singapore Government. Always consult a
            financial adviser before making investment decisions.
          </Typography>
        </Card.Content>
      </Card>

      {/* Calculator Section */}
      <Card>
        <Card.Header>
          <Card.Title>Investment Returns Calculator</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          {/* Input Controls */}
          <div className="grid gap-6 md:grid-cols-2">
            <NumberField
              className="flex flex-col gap-2"
              formatOptions={{
                style: "currency",
                currency: "SGD",
                currencyDisplay: "narrowSymbol",
                maximumFractionDigits: 0,
              }}
              minValue={1000}
              onChange={(value) =>
                setPrincipal(Number.isNaN(value) ? 1000 : value)
              }
              step={1000}
              value={principal}
            >
              <Label>Initial amount</Label>
              <NumberField.Group className="w-full grid-cols-1">
                <NumberField.Input className="w-full" />
              </NumberField.Group>
            </NumberField>

            <Slider
              className="flex flex-col gap-2"
              maxValue={40}
              minValue={1}
              onChange={(value) =>
                setYears(Array.isArray(value) ? value[0] : value)
              }
              step={1}
              value={years}
            >
              <Label>Investment period: {years} years</Label>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>

          {/* Scenario Selection */}
          <div className="flex flex-col gap-4">
            <Label>Select Investment Scenarios (max 4 for chart):</Label>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {INVESTMENT_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.name}
                  type="button"
                  onClick={() => toggleScenario(scenario.name)}
                  aria-pressed={selectedScenarios.includes(scenario.name)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedScenarios.includes(scenario.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Typography
                        className="mb-2"
                        type="body-sm"
                        weight="semibold"
                      >
                        {scenario.name}
                      </Typography>
                      <Typography className="text-zinc-600" type="body-xs">
                        {formatPercentage(scenario.rate / 100, {
                          decimalPlaces: 1,
                        })}{" "}
                        p.a.
                      </Typography>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        scenario.riskLevel === "Low"
                          ? "bg-green-100 text-green-700"
                          : scenario.riskLevel === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {scenario.riskLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Growth Chart */}
          <div
            role="img"
            aria-label="Investment growth comparison chart showing projected returns over time for selected scenarios"
          >
            <Typography className="mb-4" type="h5">
              Growth Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Years",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Value (S$)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickFormatter={(value) => formatCurrency(value, 0)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend />
                {INVESTMENT_SCENARIOS.filter((s) =>
                  selectedScenarios.includes(s.name),
                ).map((scenario) => (
                  <Line
                    key={scenario.name}
                    type="monotone"
                    dataKey={scenario.name}
                    stroke={scenario.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      {/* Comparison Table */}
      <Card>
        <Card.Header>
          <Card.Title>Final Value Comparison ({years} years)</Card.Title>
        </Card.Header>
        <Card.Content>
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Investment scenario comparison">
                <Table.Header>
                  <Table.Column isRowHeader>Investment Type</Table.Column>
                  <Table.Column>Rate p.a.</Table.Column>
                  <Table.Column>Risk Level</Table.Column>
                  <Table.Column className="text-right">
                    Final Value
                  </Table.Column>
                  <Table.Column className="text-right">Total Gain</Table.Column>
                  <Table.Column className="text-right">
                    Gain vs CPF OA
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {finalValues.map((item) => {
                    const cpfOaGain =
                      finalValues.find((v) => v.name === "CPF OA")?.totalGain ||
                      0;
                    const gainVsCpfOa = item.totalGain - cpfOaGain;

                    return (
                      <Table.Row key={item.name} id={item.name}>
                        <Table.Cell className="font-medium">
                          {item.name}
                        </Table.Cell>
                        <Table.Cell>
                          {formatPercentage(item.rate / 100, {
                            decimalPlaces: 1,
                          })}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              item.riskLevel === "Low"
                                ? "bg-green-100 text-green-700"
                                : item.riskLevel === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right font-semibold">
                          {formatCurrency(item.finalValue)}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {formatCurrency(item.totalGain)}
                        </Table.Cell>
                        <Table.Cell
                          className={`text-right font-medium ${
                            gainVsCpfOa > 0
                              ? "text-green-600"
                              : gainVsCpfOa < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {gainVsCpfOa > 0 ? "+" : ""}
                          {formatCurrency(gainVsCpfOa)}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>

      {/* Key Considerations */}
      <Card>
        <Card.Header>
          <Card.Title>Key Considerations</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 text-sm">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Typography className="mb-2 text-blue-900" type="h6">
                CPF Advantages
              </Typography>
              <ul className="flex flex-col gap-2 text-blue-800">
                <li>• Guaranteed returns by Singapore Government</li>
                <li>• No market volatility risk</li>
                <li>• Tax-free interest earnings</li>
                <li>• Automatic monthly contributions from salary</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <Typography className="mb-2 text-amber-900" type="h6">
                Investment Advantages
              </Typography>
              <ul className="flex flex-col gap-2 text-amber-800">
                <li>• Potential for higher returns (with higher risk)</li>
                <li>• More liquidity and flexibility</li>
                <li>• Diversification opportunities</li>
                <li>• Can invest beyond CPF limits</li>
              </ul>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <Typography className="mb-2 text-red-900" type="h6">
                Investment Risks
              </Typography>
              <ul className="flex flex-col gap-2 text-red-800">
                <li>• Market volatility can lead to losses</li>
                <li>• No guaranteed returns</li>
                <li>• Requires knowledge and active management</li>
                <li>
                  • Historical returns do not guarantee future performance
                </li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
