"use client";

import {
  Alert,
  Card,
  Chip,
  Label,
  NumberField,
  Slider,
  Table,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { LineChart } from "@heroui-pro/react";
import posthog from "posthog-js";
import type { Key } from "react";
import { useState } from "react";
import { Legend } from "recharts";
import { CPF_INTEREST_FLOOR_RATES } from "@/constants/cpf-interest-rates";
import { formatCurrency, formatPercentage } from "@/lib/format";

interface InvestmentScenario {
  name: string;
  rate: number;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  color: string;
}

const RISK_CHIP_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "danger",
} as const;

const INVESTMENT_SCENARIOS: InvestmentScenario[] = [
  {
    name: "CPF OA",
    rate: CPF_INTEREST_FLOOR_RATES.OA,
    description: "Ordinary Account, fixed floor rate",
    riskLevel: "Low",
    color: "var(--chart-1)",
  },
  {
    name: "CPF SA/MA/RA",
    rate: CPF_INTEREST_FLOOR_RATES.SMRA,
    description: "Special, MediSave & Retirement Accounts",
    riskLevel: "Low",
    color: "var(--chart-2)",
  },
  {
    name: "Singapore Bonds",
    rate: 3.5,
    description: "Government bonds and corporate bonds",
    riskLevel: "Low",
    color: "var(--chart-5)",
  },
  {
    name: "STI ETF",
    rate: 6.0,
    description: "Straits Times Index ETF (historical avg)",
    riskLevel: "Medium",
    color: "var(--chart-3)",
  },
  {
    name: "Global Equity ETF",
    rate: 7.5,
    description: "MSCI World Index (historical avg)",
    riskLevel: "Medium",
    color: "var(--chart-4)",
  },
  {
    name: "Tech Stocks",
    rate: 10.0,
    description: "Technology sector equities (high volatility)",
    riskLevel: "High",
    color: "var(--danger)",
  },
];

interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

function calculateGrowth(
  principal: number,
  rate: number,
  years: number,
): number {
  return principal * (1 + rate / 100) ** years;
}

function RiskChip({
  riskLevel,
}: {
  riskLevel: InvestmentScenario["riskLevel"];
}) {
  return (
    <Chip color={RISK_CHIP_COLOR[riskLevel]} size="sm" variant="soft">
      <Chip.Label>{riskLevel}</Chip.Label>
    </Chip>
  );
}

export function CPFInvestmentComparison() {
  const [principal, setPrincipal] = useState<number>(50000);
  const [years, setYears] = useState<number>(20);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    "CPF OA",
    "CPF SA/MA/RA",
    "STI ETF",
  ]);

  const handleScenarioSelection = (keys: Set<Key> | "all") => {
    if (keys === "all") return;

    const next = [...keys].map(String);
    if (next.length > 4) return;

    const added = next.find((name) => !selectedScenarios.includes(name));
    const removed = selectedScenarios.find((name) => !next.includes(name));
    const toggled = added ?? removed;

    if (toggled) {
      posthog.capture("investment_scenario_toggled", {
        scenario: toggled,
        action: added ? "added" : "removed",
        active_scenarios: next,
      });
    }

    setSelectedScenarios(next);
  };

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

  const finalValues = INVESTMENT_SCENARIOS.map((scenario) => ({
    ...scenario,
    finalValue: calculateGrowth(principal, scenario.rate, years),
    totalGain: calculateGrowth(principal, scenario.rate, years) - principal,
  }));

  const activeScenarios = INVESTMENT_SCENARIOS.filter((s) =>
    selectedScenarios.includes(s.name),
  );

  return (
    <div className="flex flex-col gap-6">
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Disclaimer</Alert.Title>
          <Alert.Description>
            The investment returns shown are historical averages and do not
            guarantee future performance. Investments carry risks including
            potential loss of principal. CPF savings are guaranteed by the
            Singapore Government. Always consult a financial adviser before
            making investment decisions.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Card>
        <Card.Header>
          <Card.Title>Investment Returns Calculator</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
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

          <div className="flex flex-col gap-4">
            <Label>Select Investment Scenarios (max 4 for chart):</Label>
            <ToggleButtonGroup
              isDetached
              aria-label="Investment scenarios"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              selectedKeys={new Set(selectedScenarios)}
              selectionMode="multiple"
              onSelectionChange={handleScenarioSelection}
            >
              {INVESTMENT_SCENARIOS.map((scenario) => (
                <ToggleButton
                  key={scenario.name}
                  className="h-auto flex-col items-stretch gap-2 p-4 text-left"
                  id={scenario.name}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-sm">
                        {scenario.name}
                      </span>
                      <span className="text-muted text-xs">
                        {formatPercentage(scenario.rate / 100, {
                          decimalPlaces: 1,
                        })}{" "}
                        p.a.
                      </span>
                    </div>
                    <RiskChip riskLevel={scenario.riskLevel} />
                  </div>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <div
            role="img"
            aria-label="Investment growth comparison chart showing projected returns over time for selected scenarios"
            className="flex flex-col gap-4"
          >
            <Typography type="h5">Growth Over Time</Typography>
            <LineChart data={chartData} height={400}>
              <LineChart.Grid strokeDasharray="3 3" />
              <LineChart.XAxis
                dataKey="year"
                label={{
                  value: "Years",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <LineChart.YAxis
                label={{
                  value: "Value (S$)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(value) => formatCurrency(value, 0)}
              />
              <LineChart.Tooltip
                content={
                  <LineChart.TooltipContent
                    labelFormatter={(label) => `Year ${label}`}
                    valueFormatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Legend />
              {activeScenarios.map((scenario) => (
                <LineChart.Line
                  key={scenario.name}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={scenario.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </div>
        </Card.Content>
      </Card>

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
                          <RiskChip riskLevel={item.riskLevel} />
                        </Table.Cell>
                        <Table.Cell className="text-right font-semibold">
                          {formatCurrency(item.finalValue)}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {formatCurrency(item.totalGain)}
                        </Table.Cell>
                        <Table.Cell
                          className={
                            gainVsCpfOa > 0
                              ? "text-right font-medium text-success"
                              : gainVsCpfOa < 0
                                ? "text-right font-medium text-danger"
                                : "text-right font-medium"
                          }
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

      <Card>
        <Card.Header>
          <Card.Title>Key Considerations</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>CPF Advantages</Alert.Title>
              <Alert.Description>
                Guaranteed returns by Singapore Government. No market volatility
                risk. Tax-free interest earnings. Automatic monthly
                contributions from salary.
              </Alert.Description>
            </Alert.Content>
          </Alert>

          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Investment Advantages</Alert.Title>
              <Alert.Description>
                Potential for higher returns (with higher risk). More liquidity
                and flexibility. Diversification opportunities. Can invest
                beyond CPF limits.
              </Alert.Description>
            </Alert.Content>
          </Alert>

          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Investment Risks</Alert.Title>
              <Alert.Description>
                Market volatility can lead to losses. No guaranteed returns.
                Requires knowledge and active management. Historical returns do
                not guarantee future performance.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </Card.Content>
      </Card>
    </div>
  );
}
