import {
  Document,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import type { PdfData } from "@/lib/download-pdf";
import type { ContributionAllocationBranch } from "@/policy";

/*
 * @react-pdf/renderer cannot read CSS custom properties, which is what
 * src/lib/brand.ts exists for. The export previously shipped its own teal and
 * slate palette, a different identity from the app.
 */
const TEAL = BRAND.forest;
const SLATE_600 = BRAND.textBody;
const SLATE_400 = BRAND.textSubtle;
const SLATE_100 = BRAND.card;

/* The fixed chart encoding: OA, SA/RA, MA. */
const PIE_COLOURS = [BRAND.chart1, BRAND.chart2, BRAND.chart3];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BRAND.ink,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: SLATE_400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: BRAND.ink,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  rowLabel: {
    color: SLATE_600,
  },
  rowValue: {
    fontFamily: "Helvetica-Bold",
  },
  rowValueAccent: {
    fontFamily: "Helvetica-Bold",
    color: TEAL,
  },
  comparisonGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: SLATE_100,
    padding: 10,
    borderRadius: 4,
  },
  comparisonLabel: {
    fontSize: 9,
    color: SLATE_600,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  positive: {
    color: BRAND.greenMid,
  },
  negative: {
    color: BRAND.clay,
  },
  distributionRow: {
    flexDirection: "row",
    gap: 20,
  },
  distributionTable: {
    flex: 1,
  },
  chartContainer: {
    width: 120,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: SLATE_400,
    textAlign: "center",
  },
  ceilingTimeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 8,
    backgroundColor: SLATE_100,
    borderRadius: 4,
  },
  ceilingValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  ceilingLabel: {
    fontSize: 8,
    color: SLATE_600,
  },
  contextBox: {
    padding: 10,
    backgroundColor: SLATE_100,
    borderRadius: 4,
  },
  contextText: {
    color: SLATE_600,
    lineHeight: 1.4,
    marginBottom: 4,
  },
});

function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDifference(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCurrency(value)}`;
}

function formatRate(rate: number): string {
  const percentage = rate * 100;
  const rounded = Math.round(percentage * 100) / 100;
  const decimalPlaces = Number.isInteger(rounded)
    ? 0
    : Number.isInteger(rounded * 10)
      ? 1
      : 2;

  return new Intl.NumberFormat("en-SG", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(rate);
}

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  size?: number;
}

function PieChart({ data, size = 100 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 5;

  let startAngle = -90;
  const paths: Array<{ d: string; fill: string }> = [];

  for (const [index, item] of data.entries()) {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    paths.push({
      d,
      fill: PIE_COLOURS[index % PIE_COLOURS.length],
    });

    startAngle = endAngle;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((path) => (
        <Path key={path.fill} d={path.d} fill={path.fill} />
      ))}
    </Svg>
  );
}

interface CpfResultsPdfProps {
  data: PdfData;
}

export function CpfResultsPdf({ data }: CpfResultsPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your CPF Savings Summary</Text>
          <Text style={styles.subtitle}>
            Generated on {formatDate(data.generatedAt)}
          </Text>
        </View>

        {/* Contribution Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Savings Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Age Group</Text>
            <Text style={styles.rowValue}>{data.ageGroup}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gross Income</Text>
            <Text style={styles.rowValue}>
              {formatCurrency(data.monthlyGrossIncome)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Take-home Income</Text>
            <Text style={styles.rowValue}>
              {formatCurrency(data.takeHomeIncome)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              You save ({formatRate(data.employeeRate)} effective)
            </Text>
            <Text style={styles.rowValueAccent}>
              {formatCurrency(data.employeeContribution)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Your employer adds ({formatRate(data.employerRate)} effective)
            </Text>
            <Text style={styles.rowValueAccent}>
              {formatCurrency(data.employerContribution)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Total going into your CPF accounts
            </Text>
            <Text style={styles.rowValueAccent}>
              {formatCurrency(data.totalContribution)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Applied wage band</Text>
            <Text style={styles.rowValue}>{data.wageBandLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Remaining Additional Wage ceiling
            </Text>
            <Text style={styles.rowValue}>
              {data.remainingAdditionalWageCeiling === null
                ? "Not calculated — annual OW and prior AW are required"
                : formatCurrency(data.remainingAdditionalWageCeiling, 0)}
            </Text>
          </View>
          <Text style={styles.contextText}>
            Effective rates above divide the rounded contribution amounts by
            contributable wages. They are not nominal full-wage-band rates.
          </Text>
        </View>

        {data.warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Context</Text>
            <View style={styles.contextBox}>
              {data.warnings.map((warning) => (
                <Text key={warning} style={styles.contextText}>
                  • {warning}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Ceiling Comparison */}
        {data.ceilingComparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How the Ceiling Change Affects You
            </Text>
            <View style={styles.ceilingTimeline}>
              <View>
                <Text style={styles.ceilingValue}>
                  {formatCurrency(data.ceilingComparison.preCeiling, 0)}
                </Text>
                <Text style={styles.ceilingLabel}>
                  Previous published ceiling
                </Text>
              </View>
              <Text style={{ color: SLATE_400 }}>→</Text>
              <View>
                <Text style={[styles.ceilingValue, { color: TEAL }]}>
                  {formatCurrency(data.ceilingComparison.currentCeiling, 0)}
                </Text>
                <Text style={styles.ceilingLabel}>Current</Text>
              </View>
            </View>
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonLabel}>Take-home pay change</Text>
                <Text
                  style={[
                    styles.comparisonValue,
                    data.ceilingComparison.takeHomeImpact >= 0
                      ? styles.positive
                      : styles.negative,
                  ]}
                >
                  {formatDifference(data.ceilingComparison.takeHomeImpact)}
                </Text>
              </View>
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonLabel}>
                  Your retirement savings change
                </Text>
                <Text
                  style={[
                    styles.comparisonValue,
                    data.ceilingComparison.cpfImpact >= 0
                      ? { color: TEAL }
                      : { color: SLATE_400 },
                  ]}
                >
                  {formatDifference(data.ceilingComparison.cpfImpact)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {data.routing?.selected === "undetermined"
              ? "Two Official Account-Routing Outcomes"
              : "Where This Month's CPF Goes"}
          </Text>
          {data.routing?.selected === "undetermined" ? (
            <View>
              <Text style={styles.contextText}>
                The retirement allocation goes to RA until the Full Retirement
                Sum is set aside, then to OA. Account context was not supplied,
                so neither branch is selected.
              </Text>
              <View style={styles.comparisonGrid}>
                <RoutingBranch
                  distribution={data.routing.branches.beforeFullRetirementSum}
                  title="Before FRS is set aside"
                />
                <RoutingBranch
                  distribution={data.routing.branches.afterFullRetirementSum}
                  title="After FRS is set aside"
                />
              </View>
            </View>
          ) : data.distribution ? (
            <View style={styles.distributionRow}>
              <View style={styles.distributionTable}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Total Going Into Your CPF</Text>
                  <Text style={styles.rowValue}>
                    {formatCurrency(data.totalContribution)}
                  </Text>
                </View>
                {data.distribution.map(({ name, value }) => (
                  <View key={name} style={styles.row}>
                    <Text style={styles.rowLabel}>{name}</Text>
                    <Text style={styles.rowValue}>{formatCurrency(value)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartContainer}>
                <PieChart data={data.distribution} size={100} />
              </View>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is an estimate only. For official calculations, please refer to
          the CPF Board website.
        </Text>
      </Page>
    </Document>
  );
}

interface RoutingBranchProps {
  title: string;
  distribution: ContributionAllocationBranch;
}

function RoutingBranch({ title, distribution }: RoutingBranchProps) {
  const rows = [
    ["Ordinary Account (OA)", distribution.OA],
    ["Retirement Account (RA)", distribution.RA],
    ["MediSave Account (MA)", distribution.MA],
  ] as const;

  return (
    <View style={styles.comparisonCard}>
      <Text style={styles.comparisonLabel}>{title}</Text>
      {rows.map(([name, value]) => (
        <View key={name} style={styles.row}>
          <Text style={styles.rowLabel}>{name}</Text>
          <Text style={styles.rowValue}>{formatCurrency(value)}</Text>
        </View>
      ))}
    </View>
  );
}
