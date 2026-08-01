"use client";

import {
  Card,
  Label,
  Link,
  NumberField,
  Slider,
  Table,
  Typography,
} from "@heroui/react";
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
import {
  calculateCompoundGrowth,
  createInvestmentScenarios,
} from "@/components/investments/investment-assumptions";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { POLICY_SOURCES } from "@/policy";

interface ChartDataPoint {
  year: number;
  [key: string]: number;
}

const CHART_COLOURS = {
  "cpf-oa": "var(--chart-1)",
  "cpf-smra": "var(--chart-2)",
  "user-assumption": "var(--chart-5)",
} as const;

/** Starting value for the editable field, not a return forecast. */
const DEFAULT_ASSUMED_ANNUAL_RETURN = 5;

export function CPFInvestmentComparison() {
  const [principal, setPrincipal] = useState(50_000);
  const [years, setYears] = useState(20);
  const [assumedAnnualReturn, setAssumedAnnualReturn] = useState(
    DEFAULT_ASSUMED_ANNUAL_RETURN,
  );

  const scenarios = createInvestmentScenarios(assumedAnnualReturn);

  const chartData: ChartDataPoint[] = Array.from(
    { length: years + 1 },
    (_, year) => {
      const dataPoint: ChartDataPoint = { year };
      for (const scenario of scenarios) {
        dataPoint[scenario.name] = calculateCompoundGrowth(
          principal,
          scenario.rate,
          year,
        );
      }
      return dataPoint;
    },
  );

  const finalValues = scenarios.map((scenario) => ({
    ...scenario,
    finalValue: calculateCompoundGrowth(principal, scenario.rate, years),
    totalGain:
      calculateCompoundGrowth(principal, scenario.rate, years) - principal,
  }));
  const cpfOaGain =
    finalValues.find(({ id }) => id === "cpf-oa")?.totalGain ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-accent/25 bg-accent/10">
        <Card.Content className="flex flex-col gap-2">
          <Typography weight="semibold">Assumption, not a forecast</Typography>
          <Typography type="body-sm">
            The non-CPF return below is your editable assumption. SimplyCPF does
            not supply a historical-average or expected market return. Results
            use smooth annual compounding and do not model fees, taxes,
            volatility, or losses along the way.
          </Typography>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Set the comparison</Card.Title>
          <Card.Description>
            CPF presets are official floor rates; the investment rate is yours.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-3">
            <NumberField
              fullWidth
              formatOptions={{
                currency: "SGD",
                currencyDisplay: "narrowSymbol",
                maximumFractionDigits: 0,
                style: "currency",
              }}
              minValue={1_000}
              name="initial-amount"
              step={1_000}
              value={principal}
              variant="secondary"
              onChange={(value) =>
                setPrincipal(Number.isNaN(value) ? 1_000 : value)
              }
            >
              <Label>Initial amount</Label>
              <NumberField.Group className="grid-cols-1">
                <NumberField.Input />
              </NumberField.Group>
            </NumberField>

            <NumberField
              fullWidth
              maxValue={100}
              minValue={-100}
              name="assumed-annual-return"
              step={0.25}
              value={assumedAnnualReturn}
              variant="secondary"
              onChange={(value) =>
                setAssumedAnnualReturn(Number.isNaN(value) ? 0 : value)
              }
            >
              <Label>Your investment return assumption (%)</Label>
              <NumberField.Group className="grid-cols-1">
                <NumberField.Input />
              </NumberField.Group>
            </NumberField>

            <Slider
              className="flex flex-col gap-2"
              maxValue={40}
              minValue={1}
              step={1}
              value={years}
              onChange={(value) =>
                setYears(Array.isArray(value) ? value[0] : value)
              }
            >
              <Label>Comparison period: {years} years</Label>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>

          <div
            aria-label="Compound growth comparison for the official CPF floor rates and the user's investment-return assumption"
            className="flex flex-col gap-4"
            role="img"
          >
            <Typography type="h5">
              Smooth compound-growth illustration
            </Typography>
            <ResponsiveContainer height={400} width="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    offset: -5,
                    position: "insideBottom",
                    value: "Years",
                  }}
                />
                <YAxis
                  label={{
                    angle: -90,
                    position: "insideLeft",
                    value: "Value (S$)",
                  }}
                  tickFormatter={(value) => formatCurrency(value, 0)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend />
                {scenarios.map((scenario) => (
                  <Line
                    dataKey={scenario.name}
                    dot={false}
                    key={scenario.id}
                    stroke={CHART_COLOURS[scenario.id]}
                    strokeWidth={2}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Final value after {years} years</Card.Title>
        </Card.Header>
        <Card.Content>
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="CPF floor and user-assumption comparison">
                <Table.Header>
                  <Table.Column isRowHeader>Scenario</Table.Column>
                  <Table.Column>Basis</Table.Column>
                  <Table.Column>Rate p.a.</Table.Column>
                  <Table.Column className="text-right">
                    Final value
                  </Table.Column>
                  <Table.Column className="text-right">Total gain</Table.Column>
                  <Table.Column className="text-right">
                    Gain vs CPF OA floor
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {finalValues.map((item) => {
                    const gainVsCpfOa = item.totalGain - cpfOaGain;

                    return (
                      <Table.Row id={item.id} key={item.id}>
                        <Table.Cell className="font-medium">
                          {item.name}
                        </Table.Cell>
                        <Table.Cell>
                          {item.basis === "official"
                            ? "Official CPF floor"
                            : "Your assumption"}
                        </Table.Cell>
                        <Table.Cell>
                          {formatPercentage(item.rate / 100, {
                            decimalPlaces: 2,
                          })}
                        </Table.Cell>
                        <Table.Cell className="text-right font-semibold">
                          {formatCurrency(item.finalValue)}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {formatCurrency(item.totalGain)}
                        </Table.Cell>
                        <Table.Cell className="text-right font-medium">
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
          <Card.Title>Read the comparison correctly</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Typography weight="semibold">CPF side</Typography>
            <Typography type="body-sm">
              {formatPercentage(scenarios[0].rate / 100, {
                decimalPlaces: 2,
              })}{" "}
              for OA and{" "}
              {formatPercentage(scenarios[1].rate / 100, {
                decimalPlaces: 2,
              })}{" "}
              for SMRA are floor rates, not estimates of a market return. CPF
              rates are reviewed quarterly under their official pegs and floors.
            </Typography>
            <Link
              href={POLICY_SOURCES.interest.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              CPF Board: how CPF interest works
              <Link.Icon aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Typography weight="semibold">Investment side</Typography>
            <Typography type="body-sm">
              The editable rate is a mathematical input only. Real investments
              can rise or fall, compound unevenly, incur costs, and lose
              principal. Set a rate that reflects the scenario you want to test;
              SimplyCPF does not recommend one.
            </Typography>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
